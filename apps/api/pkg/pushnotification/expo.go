package pushnotification

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/spf13/viper"
)

const (
	defaultExpoPushURL = "https://exp.host/--/api/v2/push/send"
	expoMaxBatchSize   = 100
)

// Message is one Expo push notification.
type Message struct {
	To        string         `json:"to"`
	Title     string         `json:"title,omitempty"`
	Body      string         `json:"body,omitempty"`
	Data      map[string]any `json:"data,omitempty"`
	Sound     string         `json:"sound,omitempty"`
	ChannelID string         `json:"channelId,omitempty"`
	Priority  string         `json:"priority,omitempty"`
	Badge     *int           `json:"badge,omitempty"`
	TTL       *int           `json:"ttl,omitempty"`
}

// Ticket is Expo's per-message send result. Status "error" means Expo
// rejected the message outright (e.g. DeviceNotRegistered) — Message and
// Details explain why.
type Ticket struct {
	Status  string         `json:"status"`
	ID      string         `json:"id,omitempty"`
	Message string         `json:"message,omitempty"`
	Details map[string]any `json:"details,omitempty"`
}

type expoResponse struct {
	Data   []Ticket `json:"data"`
	Errors []struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"errors,omitempty"`
}

type ExpoClient struct {
	httpClient  *http.Client
	baseURL     string
	accessToken string
}

// NewExpoClient reads push.expo.* from config. access_token is only needed
// when the Expo project has "Enhanced Security" enabled.
func NewExpoClient(config *viper.Viper) *ExpoClient {
	baseURL := config.GetString("push.expo.base_url")
	if baseURL == "" {
		baseURL = defaultExpoPushURL
	}

	return &ExpoClient{
		httpClient:  &http.Client{Timeout: 10 * time.Second},
		baseURL:     baseURL,
		accessToken: config.GetString("push.expo.access_token"),
	}
}

// Send delivers messages to Expo, chunking them into batches of 100 (Expo's
// per-request limit) and returning one ticket per message in the same order.
func (c *ExpoClient) Send(ctx context.Context, messages ...Message) ([]Ticket, error) {
	tickets := make([]Ticket, 0, len(messages))

	for start := 0; start < len(messages); start += expoMaxBatchSize {
		end := min(start+expoMaxBatchSize, len(messages))

		batch, err := c.sendBatch(ctx, messages[start:end])
		if err != nil {
			return nil, err
		}
		tickets = append(tickets, batch...)
	}

	return tickets, nil
}

// SendOne is a convenience wrapper for sending a single notification.
func (c *ExpoClient) SendOne(ctx context.Context, to, title, body string, data map[string]any, channelID string) (*Ticket, error) {
	tickets, err := c.Send(ctx, Message{To: to, Title: title, Body: body, Data: data, ChannelID: channelID})
	if err != nil {
		return nil, err
	}

	ticket := tickets[0]
	if ticket.Status == "error" {
		return &ticket, fmt.Errorf("pushnotification: %s", ticket.Message)
	}
	return &ticket, nil
}

func (c *ExpoClient) sendBatch(ctx context.Context, messages []Message) ([]Ticket, error) {
	body, err := json.Marshal(messages)
	if err != nil {
		return nil, fmt.Errorf("pushnotification: encode request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.baseURL, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("pushnotification: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	if c.accessToken != "" {
		req.Header.Set("Authorization", "Bearer "+c.accessToken)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("pushnotification: send request: %w", err)
	}
	defer resp.Body.Close()

	raw, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("pushnotification: read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("pushnotification: expo returned status %d: %s", resp.StatusCode, string(raw))
	}

	var parsed expoResponse
	if err := json.Unmarshal(raw, &parsed); err != nil {
		return nil, fmt.Errorf("pushnotification: decode response: %w", err)
	}
	if len(parsed.Errors) > 0 {
		return nil, fmt.Errorf("pushnotification: expo error: %s", parsed.Errors[0].Message)
	}

	return parsed.Data, nil
}

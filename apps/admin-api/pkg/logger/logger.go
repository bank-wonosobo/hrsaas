package logger

import (
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func New(v *viper.Viper) *logrus.Logger {
	log := logrus.New()

	level, err := logrus.ParseLevel(v.GetString("log.level"))
	if err != nil {
		level = logrus.InfoLevel
	}
	log.SetLevel(level)

	if v.GetString("log.format") == "json" {
		log.SetFormatter(&logrus.JSONFormatter{})
	} else {
		log.SetFormatter(&logrus.TextFormatter{FullTimestamp: true})
	}

	return log
}

func NewDefault() *logrus.Logger {
	log := logrus.New()
	log.SetLevel(logrus.DebugLevel)
	log.SetFormatter(&logrus.TextFormatter{FullTimestamp: true})
	return log
}

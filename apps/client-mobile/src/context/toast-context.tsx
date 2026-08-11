import Toast from "@/components/ui/toast";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { Animated } from "react-native";

type ToastType = "success" | "error" | "warning" | "info";

type ToastContextType = {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const translateY = useRef(new Animated.Value(-100)).current;

  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");

  const hide = useCallback(() => {
    Animated.timing(translateY, {
      toValue: -100,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info", duration = 2500) => {
      setMessage(message);
      setType(type);
      setVisible(true);

      Animated.timing(translateY, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }).start();

      setTimeout(hide, duration);
    },
    [hide],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {visible && (
        <Toast message={message} type={type} translateY={translateY} />
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

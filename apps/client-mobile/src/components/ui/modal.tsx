import { X } from "lucide-react-native";
import {
  Modal,
  ModalProps,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

interface Props extends Omit<ModalProps, "transparent"> {
  visible: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}
export default function AppModal({
  visible,
  title,
  children,
  onClose,
  animationType = "none",
  ...props
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType={animationType}
      {...props}
      statusBarTranslucent
      onRequestClose={onClose}
      {...props}
    >
      <View className="flex-1 items-center justify-center bg-black/20 px-5">
        <View className="w-full max-w-md h-[80%] rounded-2xl bg-white p-5 overflow-hidden">
          <View className="flex flex-row justify-between items-center mb-5">
            {title && (
              <Text className="font-google-flex text-xl font-bold text-gray-900">
                {title}
              </Text>
            )}
            <Pressable
              onPress={onClose}
              className="rounded-full bg-gray-50 p-2"
            >
              <X strokeWidth={2.4} size={16} color="black" />
            </Pressable>
          </View>
          <ScrollView
            className="w-full"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

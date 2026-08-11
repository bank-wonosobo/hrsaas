import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const CLOSE_DURATION = 200;
const DRAG_CLOSE_THRESHOLD = 100;
const VELOCITY_CLOSE_THRESHOLD = 0.8;

export default function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const close = () => {
    Animated.timing(translateY, {
      toValue: SCREEN_HEIGHT,
      duration: CLOSE_DURATION,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
        mass: 0.6,
      }).start();
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 6,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (
          gesture.dy > DRAG_CLOSE_THRESHOLD ||
          gesture.vy > VELOCITY_CLOSE_THRESHOLD
        ) {
          close();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 18,
            stiffness: 180,
            mass: 0.6,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View className="flex-1 justify-end bg-black/30">
        <Pressable className="absolute inset-0" onPress={close} />
        <Animated.View
          style={{
            transform: [{ translateY }],
            paddingBottom: insets.bottom + 16,
          }}
          className="rounded-t-3xl bg-white px-4 pt-3 max-h-[80%]"
        >
          <View {...panResponder.panHandlers} className="items-center pb-3">
            <View className="h-1.5 w-12 rounded-full bg-gray-200" />
            {title && (
              <Text className="font-poppins-semibold text-sm text-secondary mt-3">
                {title}
              </Text>
            )}
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

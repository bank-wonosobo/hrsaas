import clsx from "clsx";
import { createContext, ReactNode, useContext, useState } from "react";
import { Pressable, Text, View } from "react-native";

type TabsContextType = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("Tabs components must be inside <Tabs>");
  }

  return context;
}

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
}: TabsProps) {
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? controlledValue ?? "",
  );
  const value = controlledValue ?? internalValue;

  const setValue = (next: string) => {
    if (controlledValue === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  );
}

interface TabListProps {
  children: ReactNode;
}

export function TabList({ children }: TabListProps) {
  return (
    <View className="flex-row rounded-xl bg-gray-100 p-1">{children}</View>
  );
}

interface TabTriggerProps {
  value: string;
  title: string;
}

export function TabTrigger({ value, title }: TabTriggerProps) {
  const tabs = useTabs();

  const active = tabs.value === value;

  return (
    <Pressable
      onPress={() => tabs.setValue(value)}
      className={clsx("flex-1 rounded-lg px-4 py-2", active && "bg-white")}
    >
      <Text
        className={clsx(
          "text-center text-sm",
          active ? "font-poppins-semibold text-primary" : "text-gray-500",
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
}

interface TabContentProps {
  value: string;
  children: ReactNode;
}

export function TabContent({ value, children }: TabContentProps) {
  const tabs = useTabs();

  if (tabs.value !== value) return null;

  return <View className="mt-4">{children}</View>;
}

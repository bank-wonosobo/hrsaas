import { useMemo, useState } from "react";
import { Image, Text, View } from "react-native";

type AvatarProps = {
  src?: string | null;
  name?: string;
  size?: number;
};

const COLORS = [
  "#2563EB",
  "#16A34A",
  "#9333EA",
  "#EA580C",
  "#DB2777",
  "#0891B2",
  "#4F46E5",
  "#CA8A04",
];

export function Avatar({ src, name = "", size = 48 }: AvatarProps) {
  const [error, setError] = useState(false);

  const initials = useMemo(() => {
    if (!name.trim()) return "?";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0].toUpperCase())
      .join("");
  }, [name]);

  const backgroundColor = useMemo(() => {
    const index =
      name.split("").reduce((a, b) => a + b.charCodeAt(0), 0) % COLORS.length;

    return COLORS[index];
  }, [name]);

  const fontSize = size * 0.4;

  if (src && !error) {
    return (
      <Image
        source={{ uri: src }}
        onError={() => setError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
      />
    );
  }

  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
      }}
    >
      <Text
        className="text-white font-poppins-semibold"
        style={{
          color: "white",
          fontSize,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

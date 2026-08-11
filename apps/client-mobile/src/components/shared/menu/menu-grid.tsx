import BottomSheet from "@/components/ui/bottom-sheet";
import { MENUS } from "@/constants/menu";
import { Href, useRouter } from "expo-router";
import { LayoutGrid } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import MenuItem from "./menu-item";

const VISIBLE_LIMIT = 7;

export default function MenuGrid() {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const hasMore = MENUS.length > VISIBLE_LIMIT;
  const menus = hasMore ? MENUS.slice(0, VISIBLE_LIMIT) : MENUS;

  const goTo = (route: Href) => {
    setShowAll(false);
    router.push(route);
  };

  return (
    <View className="bg-white pb-4 rounded-3xl">
      <View className="flex-row flex-wrap">
        {menus.map((item) => (
          <View key={item.id} className="w-1/4 items-center">
            <MenuItem
              title={item.title}
              icon={item.icon}
              onPress={() => goTo(item.route)}
            />
          </View>
        ))}
        {hasMore && (
          <View className="w-1/4 items-center">
            <MenuItem
              title="Lainnya"
              icon={LayoutGrid}
              onPress={() => setShowAll(true)}
            />
          </View>
        )}
      </View>

      <BottomSheet
        visible={showAll}
        title="Semua Menu"
        onClose={() => setShowAll(false)}
      >
        <View className="flex-row flex-wrap pb-2">
          {MENUS.map((item) => (
            <View key={item.id} className="w-1/4 items-center">
              <MenuItem
                title={item.title}
                icon={item.icon}
                onPress={() => goTo(item.route)}
              />
            </View>
          ))}
        </View>
      </BottomSheet>
    </View>
  );
}

import Hero from "@/components/shared/hero";
import HomeTitle from "@/components/shared/home-title";
import MenuGrid from "@/components/shared/menu/menu-grid";
import AnnouncementList from "@/features/announcement/announcement-list";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshControl, ScrollView } from "react-native";

export default function Home() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ScrollView
      className="flex-1 px-4 pt-12 bg-gray-50"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3f9aae"
        />
      }
    >
      <HomeTitle />
      <Hero />
      <MenuGrid />
      <AnnouncementList />
    </ScrollView>
  );
}

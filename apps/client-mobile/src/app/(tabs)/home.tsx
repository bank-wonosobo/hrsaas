import Hero from "@/components/shared/hero";
import HomeTitle from "@/components/shared/home-title";
import MenuGrid from "@/components/shared/menu/menu-grid";
import AnnouncementList from "@/features/announcement/announcement-list";
import { ScrollView } from "react-native";

export default function Home() {
  return (
    <ScrollView
      className="flex-1 px-4 pt-12 bg-gray-50"
      showsVerticalScrollIndicator={false}
    >
      <HomeTitle />
      <Hero />
      <MenuGrid />
      <AnnouncementList />
    </ScrollView>
  );
}

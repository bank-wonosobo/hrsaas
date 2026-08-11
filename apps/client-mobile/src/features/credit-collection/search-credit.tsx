import Input from "@/components/ui/input";
import { CreditCustomer } from "@/schema/credit-collection-schema";
import clsx from "clsx";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

interface Props {
  isLoading?: boolean;
  onSearch: (param: string, key: string) => void;
  onSelect: (creditCutomer: CreditCustomer) => void;
  creditCustomer: CreditCustomer[];
}

const PARAMS = ["nama", "nopjm", "nik", , "cif"];

export default function SearchCredit({
  isLoading,
  onSearch,
  onSelect,
  creditCustomer,
}: Props) {
  const [key, setKey] = useState<string>("");
  const [param, setParam] = useState<string | undefined>(PARAMS[0]);
  const [focus, setFocus] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  return (
    <View className="z-10 absolute px-3 mt-3 w-full">
      <View
        className={clsx("bg-white p-3 rounded-2xl shadow-sm", {
          "shadow-2xl": focus,
        })}
      >
        <Text className="font-poppins-medium text-xs mb-3">
          Cari berdasarkan:{" "}
        </Text>
        <View className="flex-row gap-2 mb-3">
          {PARAMS.map((item, key) => (
            <Pressable
              className={clsx("py-1 px-3 border border-gray-200 rounded-xl", {
                "bg-primary border-0!": item === param,
              })}
              key={key}
              onPress={() => setParam(item)}
            >
              <Text
                className={`font-poppins-medium text-xs ${item === param && "text-white"}`}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <Input
          ref={inputRef}
          placeholder="Cari pinjaman nasabah"
          className="rounded-4xl"
          value={key}
          onChangeText={(text: string) => setKey(text)}
          onEndEditing={() => onSearch(param ?? "", key)}
          onFocus={() => setFocus(true)}
        />
        {isLoading ? (
          <View className="m-4">
            <ActivityIndicator color="#000" />
          </View>
        ) : (
          <>
            {creditCustomer.length > 0 && (
              <>
                <Text className="font-poppins-semibold my-3 text-xs">
                  Hasil Pencarian
                </Text>
                <ScrollView className="rounded-md max-h-60">
                  {creditCustomer.map((item, index) => (
                    <Pressable
                      key={index}
                      className="flex-row items-center justify-between mb-3 bg-gray-50 px-3 py-1 w-full active:bg-gray-100 rounded-xl"
                      onPress={() => {
                        onSelect(item);
                        setFocus(false);
                        inputRef.current?.blur();
                      }}
                    >
                      <View className="max-w-50">
                        <Text className="font-poppins-bold text-md">
                          {item.nasabah_name}
                        </Text>
                        <Text className="text-xs font-poppins-regular text-gray-400">
                          {item.address}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-xs  font-poppins-semibold">
                          {item.no_pjm}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </>
            )}
          </>
        )}
      </View>
    </View>
  );
}


import React, { useState } from "react";
import {
  useNotificationStore,
} from "@chiba/api-client";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Location from "expo-location";
import { MapPin, LocateFixed, Store, Check } from "lucide-react-native";

interface DeliveryAddressProps {
  orderType: "DELIVERY" | "PICKUP";
  address: string;
  setAddress: (val: string) => void;
  saveAsDefault: boolean;
  setSaveAsDefault: (val: boolean) => void;
}

export const DeliveryAddress = ({
  orderType,
  address,
  setAddress,
  saveAsDefault,
  setSaveAsDefault,
}: DeliveryAddressProps) => {
  const { showError, showSuccess } = useNotificationStore();

  const [locating, setLocating] = useState(false);

  const handleGetCurrentLocation = async () => {
    if (locating) return;

    try {
      setLocating(true);

      // 1. Kiểm tra và xin quyền truy cập vị trí
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        showError(
          "Quyền truy cập vị trí bị từ chối. Vui lòng cấp quyền GPS cho ứng dụng."
        );
        return;
      }

      // 2. Lấy tọa độ hiện tại
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = position.coords;

      // 3. Chuyển tọa độ thành địa chỉ
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (!results || results.length === 0) {
        showError(
          "Không thể tìm thấy địa chỉ cho tọa độ hiện tại."
        );
        return;
      }

      const place = results[0];

      // 4. Ghép các thành phần địa chỉ
      const currentAddress = [
        place.name,
        place.street,
        place.district,
        place.subregion,
        place.city,
        place.region,
        place.postalCode,
        place.country,
      ]
        .filter(
          (value, index, array) =>
            Boolean(value) &&
            array.indexOf(value) === index
        )
        .join(", ");

      if (!currentAddress.trim()) {
        showError(
          "Không thể chuyển tọa độ thành địa chỉ."
        );
        return;
      }

      // 5. Cập nhật địa chỉ lên giao diện
      setAddress(currentAddress);

      showSuccess("Đã lấy địa chỉ hiện tại.");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi không xác định.";

      showError(`Không thể lấy vị trí: ${message}`);
    } finally {
      setLocating(false);
    }
  };

  // Giao hàng nhận tại cửa hàng
  if (orderType === "PICKUP") {
    return (
      <View className="flex-row gap-3 rounded-2xl border border-gray-200 bg-[#FAF7F2] p-5">
        <Store size={24} color="#16a34a" />

        <View className="flex-1 gap-2">
          <Text className="text-xs font-black uppercase tracking-wider text-primary">
            Đến nhận trực tiếp tại cửa hàng
          </Text>

          <Text className="text-xs font-semibold leading-5 text-gray-600">
            Bạn sẽ nhận nước trực tiếp tại chi nhánh
            của Chiba. Đơn hàng này không có phí vận
            chuyển (0đ). Bạn chỉ cần đưa mã đơn hàng
            cho nhân viên tại quầy khi đến nhận.
          </Text>
        </View>
      </View>
    );
  }

  // Giao hàng tận nơi
  return (
    <View className="gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-gray-200 pb-3">
        <View className="mr-2 flex-1 flex-row items-center gap-2">
          <MapPin size={18} className="text-primary" />

          <Text className="text-xs font-black uppercase tracking-wider text-primary">
            Địa chỉ nhận hàng
          </Text>
        </View>

        <Pressable
          onPress={handleGetCurrentLocation}
          disabled={locating}
          className={`flex-row items-center gap-1 rounded-lg border border-green-200 px-2.5 py-2 ${
            locating ? "opacity-50" : "active:bg-green-50"
          }`}
        >
          {locating ? (
            <ActivityIndicator
              size="small"
              color="#16a34a"
            />
          ) : (
            <LocateFixed size={14} className="text-primary" />
          )}

          <Text className="text-[10px] font-bold text-primary">
            {locating
              ? "Đang định vị..."
              : "Lấy vị trí GPS"}
          </Text>
        </Pressable>
      </View>

      {/* Address input */}
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="Nhập số nhà, tên đường, phường/xã, quận/huyện..."
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className="min-h-24 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold leading-5 text-gray-900"
      />

      {/* Save as default */}
      <Pressable
        onPress={() => setSaveAsDefault(!saveAsDefault)}
        className="flex-row items-center gap-2.5"
        accessibilityRole="checkbox"
        accessibilityState={{ checked: saveAsDefault }}
      >
        <View
          className={`h-5 w-5 items-center justify-center rounded border ${
            saveAsDefault
              ? "border-primary bg-primary"
              : "border-gray-300 bg-white"
          }`}
        >
          {saveAsDefault && (
            <Check size={14} color="#ffffff" />
          )}
        </View>

        <Text className="flex-1 text-xs font-bold text-gray-600">
          Lưu làm địa chỉ giao hàng mặc định cho lần sau
        </Text>
      </Pressable>
    </View>
  );
};

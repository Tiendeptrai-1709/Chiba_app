import React from 'react'
import { Pressable, Text, View } from 'react-native';

interface StatCardProps {
    icon: string;
    title: string;
    value: string | number;
    colorBg: string;
    colorText: string
    onAdd?: () =>void;
}

const StatCard = ({ icon, title, value, colorBg, colorText, onAdd }: StatCardProps) => {
    return (
        <View className={`w-[48%] rounded-xl p-4 ${colorBg} flex-row items-center justify-between mt-1`}>
            {/* Title + Button cùng một hàng */}
            <View className="">
                <Text className="text-2xl">
                    {icon}
                </Text>

                <Text className={`text-xs font-bold ${colorText}-500`}>
                    {title}
                </Text>


                <Text className={`text-xl font-black ${colorText}-900 mt-0.5`}>
                    {value}
                </Text>
            </View>
            <View>
                {(onAdd & user.role) && (
                    <Pressable
                        onPress={onAdd}
                        className="bg-primary py-3 px-5 rounded-xl hover:bg-primary-hover"
                    >
                        <Text className="text-white font-semibold ">
                            + Thêm sản phẩm
                        </Text>
                    </Pressable>
                )}
            </View>
        </View>
    );
};
export default StatCard

"use client";

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { useRouter } from "expo-router";

import { useProfile } from "@chiba/api-client";
import { api } from "@/lib/axios";

import HeaderTabRole from "@/components/dashboard/HeaderTabRole";
import StockController from "@/components/dashboard/StockController";
import TransactionHistory from "@/components/dashboard/TransactionHistory";
import CustomerManager from "@/components/dashboard/CustomerManager";
import OrderFulfillment from "@/components/dashboard/OrderFulfillments";
import SystemOverview from "@/components/dashboard/SystemOverview";
// import PointActionModal from "@/components/ui/PointActionModal";

export interface MockOrder {
  id: string;
  userId?: string;
  customerName: string;
  address: string;
  items: string;
  total: number;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
}

export default function AdminDashboard() {
  const router = useRouter();
  const { data: user, isLoading } = useProfile(api);

  const isAdmin = user?.role === "ADMIN";
  const [activeTab, setActiveTab] = useState("");
  const [mockOrders, setMockOrders] = useState<MockOrder[]>([]);
  const [allCustomers] = useState([]);
  const [pointAction, setPointAction] = useState<{customer: any, type:string} | null>(null);

  useEffect(() => {
    if (user) {
      setActiveTab(user.role === "ADMIN" ? "SYSTEM" : "ORDERS");
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading) {
      if (user?.role !== "ADMIN" && user?.role !== "STAFF") {
        router.replace("/");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#1E4620" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* HEADER */}
      <View className="bg-card border-b border-border px-5 py-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="p-2 rounded-full border border-border"
          >
            <ArrowLeft size={18} color="#1F1914" />
          </Pressable>
          <Text className="text-lg font-bold text-foreground">
            📊 Bảng điều khiển
          </Text>
        </View>

        <View
          className={`px-3 py-1 rounded-full ${
            isAdmin ? "bg-primary/10" : "bg-accent/10"
          }`}
        >
          <Text className="text-xs font-bold">{user.role}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-6 gap-5"
      >
        {activeTab && (
          <HeaderTabRole
            isAdmin={isAdmin}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            refreshCustomers={() => {}}
          />
        )}

        {isAdmin && activeTab === "SYSTEM" && (
          <SystemOverview
            mockOrders={mockOrders}
            allCustomers={allCustomers}
            user={user}
          />
        )}

        {activeTab === "CUSTOMERS" && (
          <CustomerManager
            mockOrders={mockOrders}
            allCustomers={allCustomers}
            isAdmin={isAdmin}
            onTriggerAction={(customer, type) =>
              setPointAction({ customer, type })
            }
          />
        )}

        {isAdmin && activeTab === "HISTORY" && <TransactionHistory />}

        {!isAdmin && activeTab === "ORDERS" && (
          <OrderFulfillment
            mockOrders={mockOrders}
            setMockOrders={setMockOrders}
          />
        )}

        {!isAdmin && activeTab === "STOCKS" && <StockController />}

        {/* INFO BOX */}
        <View className="p-4 bg-[#FAF7F2] border border-border rounded-xl flex-row gap-3">
          <Sparkles size={20} color="#1E4620" />
          <View className="flex-1">
            <Text className="font-bold text-sm">Vai trò hệ thống</Text>
            <Text className="text-xs text-muted-foreground mt-1">
              {isAdmin
                ? "Bạn đang ở chế độ Admin: Quản lý thống kê, CRUD điểm tích lũy và kiểm tra nhật ký điểm."
                : "Bạn đang ở chế độ Staff: vận hành đơn hàng, quản lý kho và hỗ trợ khách hàng."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* {pointAction && (
        <PointActionModal
          action={pointAction}
          onClose={() => setPointAction(null)}
          onSetNotification={(type, msg) => {
            if (type === "success") showSuccess(msg);
            else showError(msg);
          }}
        />
      )} */}
    </View>
  );
}
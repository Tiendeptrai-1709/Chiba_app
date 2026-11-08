import { Alert, Platform } from 'react-native';

// Hộp xác nhận: trên điện thoại dùng hộp thoại hệ thống, trên bản web dùng window.confirm
export function confirm(title: string, message: string, okText = 'Đồng ý', destructive = false): Promise<boolean> {
  if (Platform.OS === 'web') return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  return new Promise((resolve) =>
    Alert.alert(
      title,
      message,
      [
        { text: 'Không', style: 'cancel', onPress: () => resolve(false) },
        { text: okText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    ),
  );
}

// Cho phép dùng className (NativeWind) trên các component của thư viện ngoài
import { cssInterop } from 'nativewind';
import { LinearGradient } from 'expo-linear-gradient';

cssInterop(LinearGradient, { className: 'style' });

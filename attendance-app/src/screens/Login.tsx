import { View, Text, StyleSheet, Alert } from 'react-native';
import { FC, useState, useContext } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import Input from '../components/Input';
import Button from '../components/Button';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://attendance-tracking-system-y2j4.onrender.com/auth/login',
        { email, password },
        { timeout: 30000 }
      );
      await login(response.data.token); // Use AuthContext's login
      Alert.alert('Success', 'Logged in successfully!');
      // Navigation to Home is handled by App.tsx
    } catch (error: any) {
      console.error('Login error:', error.response?.data, error.message);
      Alert.alert('Error', error.response?.data?.error || 'Login failed: Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Loading...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
      <Button title="Register" onPress={() => navigation.navigate('Register')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default LoginScreen;
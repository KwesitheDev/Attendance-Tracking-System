import { View, Text, StyleSheet, Alert } from 'react-native';
import { FC, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import Input from '../components/Input';
import Button from '../components/Button';
import axios from 'axios';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://attendance-tracking-system-y2j4.onrender.com/auth/login', {
        email,
        password,
      },{timeout: 30000});
      Alert.alert('Success', 'Logged in successfully!');
      console.log('Token:', response.data.token);
      // TODO: Save token (e.g., AsyncStorage) and navigate to main app
    } catch (error: any) {
      console.log('Login error:', error.response?.data?.error, error.message);
      Alert.alert('Error', error.response?.data?.error || 'Login failed: Network error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}
      />
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
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

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [indexNumber, setIndexNumber] = useState('');
  const [department, setDepartment] = useState('');

  const handleRegister = async () => {
    if (!/^[A-Z]{2}\d{4}-\d{3}$/.test(indexNumber)) {
      Alert.alert('Error', 'Invalid index number format (e.g., CS2023-001)');
      return;
    }
    try {
      const response = await axios.post('https://attendance-tracking-system-y2j4.onrender.com/auth/register', {
        email,
        password,
        name,
        indexNumber,
        department,
      },{timeout: 30000});
      Alert.alert('Success', 'Registered successfully! Please login.');
      navigation.navigate('Login');
    } catch (error: any) {
      console.log('Registration error:', error.response?.data?.error, error.message);
      Alert.alert('Error', error.response?.data?.error || 'Registration failed: Network error');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Input placeholder="Name" value={name} onChangeText={setName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Input
        placeholder="Index Number (e.g., CS2023-001)"
        value={indexNumber}
        onChangeText={setIndexNumber}
      />
      <Input placeholder="Department" value={department} onChangeText={setDepartment} />
      <Button title="Register" onPress={handleRegister} />
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
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

export default RegisterScreen;
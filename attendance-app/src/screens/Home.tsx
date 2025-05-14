import { View, Text, StyleSheet } from 'react-native';
import { FC, useContext } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../components/Button';
import { AuthContext } from '../context/AuthContext';

type RootStackParamList = {
    Home: undefined;
    CourseSearch: undefined;
    Login: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: FC<Props> = ({ navigation }) => {
    const { logout } = useContext(AuthContext);

    const handleLogout = async () => {
        await logout();
        // Navigation to Login is handled by App.tsx
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Attendance App</Text>
            <Button
                title="Search Courses"
                onPress={() => navigation.navigate('CourseSearch')}
            />
            <Button title="Logout" onPress={handleLogout} />
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

export default HomeScreen;
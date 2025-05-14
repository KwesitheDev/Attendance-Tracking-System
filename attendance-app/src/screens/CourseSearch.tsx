import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { FC, useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import Input from '../components/Input';
import Button from '../components/Button';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

type RootStackParamList = {
    Home: undefined;
    CourseSearch: undefined;
};

type Course = {
    _id: string;
    title: string;
    code: string;
};

type CourseSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CourseSearch'>;

interface Props {
    navigation: CourseSearchScreenNavigationProp;
}

const CourseSearchScreen: FC<Props> = () => {
    const [query, setQuery] = useState('');
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(false);

    const searchCourses = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                Alert.alert('Error', 'Please login again');
                return;
            }
            const response = await axios.get(
                `https://attendance-tracking-system-y2j4.onrender.com/courses/search?query=${query}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 30000,
                }
            );
            setCourses(response.data);
        } catch (error: any) {
            console.error('Search error:', error.response?.data, error.message);
            Alert.alert('Error', error.response?.data?.error || 'Search failed: Network error');
        } finally {
            setLoading(false);
        }
    };

    const requestEnrollment = async (courseId: string) => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                Alert.alert('Error', 'Please login again');
                return;
            }
            await axios.post(
                'https://attendance-tracking-system-y2j4.onrender.com/enrollment/request',
                { courseId },
                {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 30000,
                }
            );
            Alert.alert('Success', 'Enrollment requested!');
        } catch (error: any) {
            console.error('Enrollment error:', error.response?.data, error.message);
            Alert.alert('Error', error.response?.data?.error || 'Enrollment failed: Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Search Courses</Text>
            <Input
                placeholder="Enter course title or code (e.g., CS101)"
                value={query}
                onChangeText={setQuery}
            />
            <Button
                title={loading ? 'Searching...' : 'Search'}
                onPress={searchCourses}
                disabled={loading}
            />
            <FlatList
                data={courses}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <View style={styles.courseItem}>
                        <Text>{item.title} ({item.code})</Text>
                        <Button
                            title="Enroll"
                            onPress={() => requestEnrollment(item._id)}
                            disabled={loading}
                        />
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    courseItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default CourseSearchScreen;

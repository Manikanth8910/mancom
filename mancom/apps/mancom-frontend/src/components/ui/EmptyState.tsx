import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../config/theme';

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon = '📭',
    title,
    description,
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
        marginTop: 40,
    },
    icon: {
        fontSize: 60,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        color: theme.colors.text.disabled,
        textAlign: 'center',
    },
});

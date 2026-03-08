# Adding a New Screen

This tutorial shows how to add a new screen to the app.

## Step 1: Create the Screen Component

Create `src/screens/feature/FeatureScreen.tsx`:

```typescript
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Loading, ErrorMessage } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchData,
  selectData,
  selectIsLoading,
  selectError,
} from '../../store/slices/featureSlice';
import { theme } from '../../config/theme';

export function FeatureScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const data = useAppSelector(selectData);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  // Handle loading state
  if (isLoading && !data) {
    return <Loading message="Loading..." />;
  }

  // Handle error state
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => dispatch(fetchData())}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Feature</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Content */}
      <View style={styles.content}>
        <Text>Feature content goes here</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
});

export default FeatureScreen;
```

## Step 2: Add Navigation Types

Update `src/types/navigation.ts`:

```typescript
// If adding to MainTabs
export type MainTabParamList = {
  Home: undefined;
  Visitors: undefined;
  Payments: undefined;
  Helpdesk: undefined;
  Profile: undefined;
  Feature: undefined; // Add new screen
};

// If adding to a stack
export type FeatureStackParamList = {
  FeatureList: undefined;
  FeatureDetail: { id: string };
  AddFeature: undefined;
};
```

## Step 3: Add to Navigation

### Option A: Add to Existing Tab Navigator

Update `src/navigation/MainTabs.tsx`:

```typescript
import { FeatureScreen } from '../screens/feature/FeatureScreen';

// In the Tab.Navigator
<Tab.Screen
  name="Feature"
  component={FeatureScreen}
  options={{
    tabBarIcon: ({ focused }) => <TabIcon label="⭐" focused={focused} />,
  }}
/>
```

### Option B: Create a New Stack Navigator

Create `src/navigation/FeatureStack.tsx`:

```typescript
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeatureListScreen } from '../screens/feature/FeatureListScreen';
import { FeatureDetailScreen } from '../screens/feature/FeatureDetailScreen';
import { AddFeatureScreen } from '../screens/feature/AddFeatureScreen';
import type { FeatureStackParamList } from './types';
import { theme } from '../config/theme';

const Stack = createNativeStackNavigator<FeatureStackParamList>();

export function FeatureStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerTintColor: theme.colors.primary,
      }}
    >
      <Stack.Screen
        name="FeatureList"
        component={FeatureListScreen}
        options={{ title: 'Features' }}
      />
      <Stack.Screen
        name="FeatureDetail"
        component={FeatureDetailScreen}
        options={{ title: 'Feature Details' }}
      />
      <Stack.Screen
        name="AddFeature"
        component={AddFeatureScreen}
        options={{ title: 'Add Feature' }}
      />
    </Stack.Navigator>
  );
}
```

### Option C: Add Screen to Root Navigator

For modal screens or screens outside main flow:

```typescript
// In src/navigation/index.tsx
<Stack.Screen
  name="FeatureModal"
  component={FeatureModalScreen}
  options={{ presentation: 'modal' }}
/>
```

## Step 4: Navigate to the Screen

```typescript
import { useNavigation } from '@react-navigation/native';

function SomeComponent() {
  const navigation = useNavigation();

  const handlePress = () => {
    // Navigate to tab screen
    navigation.navigate('Feature');

    // Navigate to stack screen with params
    navigation.navigate('FeatureDetail', { id: '123' });

    // Navigate to modal
    navigation.navigate('FeatureModal');
  };
}
```

## Step 5: Receive Navigation Params

```typescript
import { useRoute } from '@react-navigation/native';
import type { FeatureStackScreenProps } from '../navigation/types';

type RouteProp = FeatureStackScreenProps<'FeatureDetail'>['route'];

function FeatureDetailScreen() {
  const route = useRoute<RouteProp>();
  const { id } = route.params;

  // Use id to fetch data...
}
```

## Screen Template

Use this template for new screens:

```typescript
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { theme } from '../../config/theme';

interface Props {
  // Add props if needed
}

export function NewScreen({}: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Screen Title</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.content}>
        {/* Content */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
});

export default NewScreen;
```

## Checklist

- [ ] Screen component created
- [ ] Navigation types updated
- [ ] Screen added to navigator
- [ ] Navigation working correctly
- [ ] Params passed if needed
- [ ] Loading/error states handled
- [ ] Styles use theme constants

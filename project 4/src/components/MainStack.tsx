import { BaseNavigationContainer } from '@react-navigation/core';
import * as React from "react";
import { stackNavigatorFactory } from "react-nativescript-navigation";

import { LoginScreen } from "./LoginScreen";
import { RouteScreen } from "./RouteScreen";
import { MapScreen } from "./MapScreen";

const StackNavigator = stackNavigatorFactory();

/**
 * The main stack navigator for the whole app.
 */
export const MainStack = () => (
    <BaseNavigationContainer>
        <StackNavigator.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerStyle: {
                    // backgroundColor: "white",
                },
                headerShown: false,
            }}
        >
            <StackNavigator.Screen
                name="Login"
                component={LoginScreen}
            />
            <StackNavigator.Screen
                name="Route"
                component={RouteScreen}
            />
            <StackNavigator.Screen
                name="Map"
                component={MapScreen}
            />
        </StackNavigator.Navigator>
    </BaseNavigationContainer>
);

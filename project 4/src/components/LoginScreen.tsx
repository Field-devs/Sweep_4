import * as React from "react";
import { Image, ApplicationSettings } from "@nativescript/core";
import { StyleSheet } from "react-nativescript";
import { useColorScheme } from "react-nativescript";
import { FrameNavigationProp } from "react-nativescript-navigation";
import { MainStackParamList } from "../NavigationParamList";
import { requestLocationPermission } from "../utils/permissions";

type LoginScreenProps = {
  navigation: FrameNavigationProp<MainStackParamList, "Login">;
};

export function LoginScreen({ navigation }: LoginScreenProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const colorScheme = useColorScheme();
  
  const logoUrl = colorScheme === 'dark' 
    ? 'https://static.wixstatic.com/media/0cc329_0d3cd276e35f472296929bc8f561526c~mv2.png'
    : 'https://static.wixstatic.com/media/0cc329_044d02e00b1b410f8019a03692f4d159~mv2.png';

  const handleLogin = async () => {
    // TODO: Implement actual login logic
    if (email && password) {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        // TODO: Show error message
        return;
      }
      
      ApplicationSettings.setString("user", email);
      navigation.navigate("Route");
    }
  };

  return (
    <gridLayout rows="*, auto, *" className="bg-cover">
      <image row="0" rowSpan="3" src="https://static.wixstatic.com/media/0cc329_259a6118ee914ed7a5dee69a9e3ef525~mv2.jpeg" stretch="aspectFill" />
      
      <stackLayout row="1" className="p-4 bg-white/80 dark:bg-black/80 backdrop-blur-lg rounded-lg m-8">
        <image src={logoUrl} className="h-20 w-20 self-center mb-4" />
        
        <textField
          hint="Email"
          text={email}
          keyboardType="email"
          autocorrect={false}
          autocapitalizationType="none"
          onTextChange={(e) => setEmail(e.value)}
          className="input p-4 mb-4 rounded-lg bg-white/90 dark:bg-black/90"
        />
        
        <textField
          hint="Senha"
          secure={true}
          text={password}
          onTextChange={(e) => setPassword(e.value)}
          className="input p-4 mb-4 rounded-lg bg-white/90 dark:bg-black/90"
        />
        
        <button
          text="Entrar"
          onTap={handleLogin}
          className="btn p-4 rounded-lg bg-blue-500 text-white font-bold"
        />
        
        <flexboxLayout className="justify-between mt-4">
          <button
            text="Esqueci minha senha"
            className="text-blue-500"
            onTap={() => console.log("Forgot password")}
          />
          <button
            text="Cadastrar"
            className="text-blue-500"
            onTap={() => console.log("Register")}
          />
        </flexboxLayout>
      </stackLayout>
    </gridLayout>
  );
}
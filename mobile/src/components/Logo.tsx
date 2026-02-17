import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 60 }: LogoProps): React.JSX.Element {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image 
        source={require('../assets/logo.png')} 
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

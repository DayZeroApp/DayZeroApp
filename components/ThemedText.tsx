import { Text, TextProps } from 'react-native';

export function ThemedText({ style, ...props }: TextProps) {
  return <Text style={style} {...props} />;
}

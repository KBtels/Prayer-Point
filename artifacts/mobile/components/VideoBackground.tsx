import { VideoView, useVideoPlayer } from "expo-video";
import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";

type Props = {
  source: number;
  webUrl?: string;
  style?: ViewStyle | ViewStyle[];
  contentFit?: "cover" | "contain" | "fill";
};

export function VideoBackground({ source, webUrl, style, contentFit = "cover" }: Props) {
  if (Platform.OS === "web") {
    return React.createElement(
      "div",
      {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          pointerEvents: "none",
        },
      },
      webUrl
        ? React.createElement("video", {
            src: webUrl,
            autoPlay: true,
            loop: true,
            muted: true,
            playsInline: true,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: contentFit === "contain" ? "contain" : "cover",
            },
          })
        : null,
    );
  }

  return <NativeVideo source={source} style={style} contentFit={contentFit} />;
}

function NativeVideo({
  source,
  style,
  contentFit,
}: Pick<Props, "source" | "style" | "contentFit">) {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit={contentFit}
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
});

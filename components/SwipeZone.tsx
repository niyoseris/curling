import { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';
import Svg, { Circle, Line, Ellipse, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface SwipeZoneProps {
  canThrow: boolean;
  onThrow: (power: number, angle: number) => void;
  playerTeam: 'red' | 'yellow';
  isBusy: boolean;
  isAiThinking: boolean;
  width: number;
  height: number;
}

export default function SwipeZone({ canThrow, onThrow, playerTeam, isBusy, isAiThinking, width, height }: SwipeZoneProps) {
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const canThrowRef = useRef(canThrow);
  const onThrowRef = useRef(onThrow);
  canThrowRef.current = canThrow;
  onThrowRef.current = onThrow;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canThrowRef.current,
      onMoveShouldSetPanResponder: () => canThrowRef.current,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setDragOffset({ dx: 0, dy: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        setDragOffset({ dx: gesture.dx, dy: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const dx = gesture.dx;
        const dy = gesture.dy;
        const swipeDist = Math.sqrt(dx * dx + dy * dy);

        if (swipeDist > 15 && dy < -10) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          const maxDrag = 120;
          const power = Math.min(swipeDist / maxDrag, 1);
          const angle = Math.atan2(dx, -dy);
          onThrowRef.current(power, angle);
        }

        setDragOffset(null);
      },
      onPanResponderTerminate: () => {
        setDragOffset(null);
      },
    })
  ).current;

  const dragDist = dragOffset ? Math.sqrt(dragOffset.dx ** 2 + dragOffset.dy ** 2) : 0;
  const dragPower = Math.min(dragDist / 120, 1);
  const isDragging = !!dragOffset && dragDist > 5;

  const stoneX = width / 2;
  const stoneY = height * 0.65;
  const stoneR = 16;

  const arrowEndX = isDragging ? stoneX - dragOffset!.dx * 1.5 : stoneX;
  const arrowEndY = isDragging ? stoneY - dragOffset!.dy * 1.5 : stoneY;

  const getPowerColor = () => {
    if (dragPower < 0.35) return Colors.powerLow;
    if (dragPower < 0.65) return Colors.powerMid;
    return Colors.powerHigh;
  };

  const isRed = playerTeam === 'red';

  return (
    <View style={[styles.container, { width, height }]} {...panResponder.panHandlers}>
      <Svg width={width} height={height}>
        <Defs>
          <SvgLinearGradient id="zoneBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#1B2838" />
            <Stop offset="100%" stopColor="#0D1B2A" />
          </SvgLinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#zoneBg)" rx={20} />

        <Line x1={width / 2} y1={8} x2={width / 2} y2={height - 8} stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="4,6" />
        <Line x1={16} y1={stoneY} x2={width - 16} y2={stoneY} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />

        {isDragging && (
          <>
            <Line
              x1={stoneX}
              y1={stoneY}
              x2={arrowEndX}
              y2={arrowEndY}
              stroke={getPowerColor()}
              strokeWidth={4}
              strokeLinecap="round"
              opacity={0.85}
            />
            {Array.from({ length: 6 }).map((_, i) => {
              const t = (i + 1) / 7;
              const dotX = stoneX + (arrowEndX - stoneX) * t;
              const dotY = stoneY + (arrowEndY - stoneY) * t;
              return (
                <Circle key={`trail-${i}`} cx={dotX} cy={dotY} r={2.5} fill={getPowerColor()} opacity={0.5 - i * 0.06} />
              );
            })}
            <Circle cx={arrowEndX} cy={arrowEndY} r={7} fill={getPowerColor()} opacity={0.9} />
          </>
        )}

        {canThrow && (
          <>
            <Circle cx={stoneX} cy={stoneY} r={stoneR + 6} fill="rgba(30,136,229,0.12)" />
            <Circle cx={stoneX} cy={stoneY} r={stoneR + 2} fill="rgba(0,0,0,0.25)" />
            <Circle cx={stoneX} cy={stoneY} r={stoneR} fill={isRed ? Colors.stoneRed : Colors.stoneYellow} />
            <Circle cx={stoneX} cy={stoneY} r={stoneR * 0.65} fill={isRed ? Colors.stoneRedDark : Colors.stoneYellowDark} />
            <Ellipse cx={stoneX - stoneR * 0.2} cy={stoneY - stoneR * 0.2} rx={stoneR * 0.25} ry={stoneR * 0.18} fill="rgba(255,255,255,0.4)" />
          </>
        )}
      </Svg>

      {canThrow && !isDragging && (
        <View style={styles.hintOverlay} pointerEvents="none">
          <Ionicons name="arrow-up" size={20} color="rgba(255,255,255,0.25)" />
          <Text style={styles.hintText}>Swipe up to throw</Text>
        </View>
      )}

      {isDragging && (
        <View style={styles.powerOverlay} pointerEvents="none">
          <View style={[styles.powerBadge, { backgroundColor: getPowerColor() }]}>
            <Text style={styles.powerText}>{Math.round(dragPower * 100)}%</Text>
          </View>
        </View>
      )}

      {!canThrow && (
        <View style={styles.statusOverlay} pointerEvents="none">
          {isAiThinking ? (
            <View style={styles.aiStatusRow}>
              <Ionicons name="hardware-chip" size={18} color={Colors.accent} />
              <Text style={styles.statusTextAi}>AI is thinking...</Text>
            </View>
          ) : isBusy ? (
            <Text style={styles.statusText}>Stone in motion...</Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  hintOverlay: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 2,
  },
  hintText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.25)',
    letterSpacing: 0.5,
  },
  powerOverlay: {
    position: 'absolute',
    top: 12,
    right: 16,
  },
  powerBadge: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  powerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
  },
  aiStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTextAi: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
  },
});

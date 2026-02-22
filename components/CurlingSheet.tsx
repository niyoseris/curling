import { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Text } from 'react-native';
import Svg, { Rect, Circle, Line, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Stone, PhysicsConfig } from '@/lib/physics';
import Colors from '@/constants/colors';

interface CurlingSheetProps {
  stones: Stone[];
  config: PhysicsConfig;
  width: number;
  height: number;
  canThrow: boolean;
  onThrow: (power: number, angle: number) => void;
  playerTeam: 'red' | 'yellow';
}

function StoneView({ stone, scaleX, scaleY }: { stone: Stone; scaleX: number; scaleY: number }) {
  const cx = stone.x * scaleX;
  const cy = stone.y * scaleY;
  const r = 10 * scaleX;
  const isRed = stone.team === 'red';

  return (
    <>
      <Circle cx={cx} cy={cy} r={r + 2} fill="rgba(0,0,0,0.15)" />
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill={isRed ? Colors.stoneRed : Colors.stoneYellow}
      />
      <Circle
        cx={cx}
        cy={cy}
        r={r * 0.65}
        fill={isRed ? Colors.stoneRedDark : Colors.stoneYellowDark}
      />
      <Ellipse
        cx={cx - r * 0.2}
        cy={cy - r * 0.2}
        rx={r * 0.25}
        ry={r * 0.15}
        fill="rgba(255,255,255,0.35)"
      />
    </>
  );
}

export default function CurlingSheet({ stones, config, width, height, canThrow, onThrow, playerTeam }: CurlingSheetProps) {
  const scaleX = width / config.sheetWidth;
  const scaleY = height / config.sheetHeight;
  const centerX = config.houseCenter.x * scaleX;
  const centerY = config.houseCenter.y * scaleY;

  const houseRadii = [60, 45, 30, 15];

  const stoneStartX = width / 2;
  const stoneStartY = height - 30;
  const stoneR = 10 * scaleX;

  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number } | null>(null);
  const dragRef = useRef<{ dx: number; dy: number } | null>(null);
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
        dragRef.current = { dx: 0, dy: 0 };
        setDragOffset({ dx: 0, dy: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        dragRef.current = { dx: gesture.dx, dy: gesture.dy };
        setDragOffset({ dx: gesture.dx, dy: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const dx = gesture.dx;
        const dy = gesture.dy;

        const swipeDist = Math.sqrt(dx * dx + dy * dy);

        if (swipeDist > 15 && dy < -10) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          const maxDrag = 100;
          const power = Math.min(swipeDist / maxDrag, 1);
          const angle = Math.atan2(dx, -dy);
          onThrowRef.current(power, angle);
        }

        dragRef.current = null;
        setDragOffset(null);
      },
      onPanResponderTerminate: () => {
        dragRef.current = null;
        setDragOffset(null);
      },
    })
  ).current;

  const dragDist = dragOffset ? Math.sqrt(dragOffset.dx ** 2 + dragOffset.dy ** 2) : 0;
  const dragPower = Math.min(dragDist / 100, 1);
  const isDragging = !!dragOffset && dragDist > 5;

  const arrowEndX = isDragging ? stoneStartX - dragOffset!.dx * 1.2 : stoneStartX;
  const arrowEndY = isDragging ? stoneStartY - dragOffset!.dy * 1.2 : stoneStartY;

  const getPowerColor = () => {
    if (dragPower < 0.35) return Colors.powerLow;
    if (dragPower < 0.65) return Colors.powerMid;
    return Colors.powerHigh;
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <View style={StyleSheet.absoluteFill} {...panResponder.panHandlers}>
        <Svg width={width} height={height}>
          <Defs>
            <RadialGradient id="iceGrad" cx="50%" cy="30%" r="80%">
              <Stop offset="0%" stopColor="#F5FBFF" />
              <Stop offset="100%" stopColor="#E0EEF8" />
            </RadialGradient>
          </Defs>

          <Rect x={0} y={0} width={width} height={height} fill="url(#iceGrad)" />

          {Array.from({ length: 40 }).map((_, i) => (
            <Line
              key={`ice-${i}`}
              x1={0}
              y1={i * (height / 40)}
              x2={width}
              y2={i * (height / 40)}
              stroke="rgba(176, 216, 240, 0.12)"
              strokeWidth={0.5}
            />
          ))}

          <Line
            x1={centerX}
            y1={0}
            x2={centerX}
            y2={height}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={1}
            strokeDasharray="4,4"
          />

          {houseRadii.map((r, i) => (
            <Circle
              key={`house-${i}`}
              cx={centerX}
              cy={centerY}
              r={r * scaleX}
              fill={i === 0 ? '#1565C0' : i === 1 ? '#FFFFFF' : i === 2 ? '#D32F2F' : '#FFFFFF'}
              stroke={i === 0 ? '#0D47A1' : i === 2 ? '#B71C1C' : '#CFD8DC'}
              strokeWidth={1.5}
            />
          ))}

          <Line
            x1={0}
            y1={centerY}
            x2={width}
            y2={centerY}
            stroke="rgba(0,0,0,0.1)"
            strokeWidth={1}
          />

          <Line
            x1={0}
            y1={config.hogLineY * scaleY}
            x2={width}
            y2={config.hogLineY * scaleY}
            stroke="#D32F2F"
            strokeWidth={2}
          />

          <Line
            x1={0}
            y1={config.backLineY * scaleY}
            x2={width}
            y2={config.backLineY * scaleY}
            stroke="#1565C0"
            strokeWidth={1.5}
          />

          <Line
            x1={0}
            y1={(config.sheetHeight - 60) * scaleY}
            x2={width}
            y2={(config.sheetHeight - 60) * scaleY}
            stroke="#D32F2F"
            strokeWidth={2}
          />

          {stones.map((stone) => (
            <StoneView key={stone.id} stone={stone} scaleX={scaleX} scaleY={scaleY} />
          ))}

          {isDragging && (
            <>
              <Line
                x1={stoneStartX}
                y1={stoneStartY}
                x2={arrowEndX}
                y2={arrowEndY}
                stroke={getPowerColor()}
                strokeWidth={3}
                strokeLinecap="round"
                opacity={0.8}
              />
              <Circle
                cx={arrowEndX}
                cy={arrowEndY}
                r={5}
                fill={getPowerColor()}
                opacity={0.8}
              />
              {Array.from({ length: 5 }).map((_, i) => {
                const t = (i + 1) / 6;
                const dotX = stoneStartX + (arrowEndX - stoneStartX) * t;
                const dotY = stoneStartY + (arrowEndY - stoneStartY) * t;
                return (
                  <Circle
                    key={`trail-${i}`}
                    cx={dotX}
                    cy={dotY}
                    r={2}
                    fill={getPowerColor()}
                    opacity={0.4}
                  />
                );
              })}
            </>
          )}

          {canThrow && (
            <>
              <Circle cx={stoneStartX} cy={stoneStartY} r={stoneR + 4} fill="rgba(30,136,229,0.15)" />
              <Circle cx={stoneStartX} cy={stoneStartY} r={stoneR + 2} fill="rgba(0,0,0,0.12)" />
              <Circle
                cx={stoneStartX}
                cy={stoneStartY}
                r={stoneR}
                fill={playerTeam === 'red' ? Colors.stoneRed : Colors.stoneYellow}
              />
              <Circle
                cx={stoneStartX}
                cy={stoneStartY}
                r={stoneR * 0.65}
                fill={playerTeam === 'red' ? Colors.stoneRedDark : Colors.stoneYellowDark}
              />
              <Ellipse
                cx={stoneStartX - stoneR * 0.2}
                cy={stoneStartY - stoneR * 0.2}
                rx={stoneR * 0.25}
                ry={stoneR * 0.15}
                fill="rgba(255,255,255,0.35)"
              />
            </>
          )}
        </Svg>
      </View>

      {canThrow && !isDragging && (
        <View style={styles.hintContainer} pointerEvents="none">
          <Text style={styles.hintText}>Swipe up to throw</Text>
        </View>
      )}

      {isDragging && (
        <View style={styles.powerIndicator} pointerEvents="none">
          <View style={[styles.powerBadge, { backgroundColor: getPowerColor() }]}>
            <Text style={styles.powerText}>{Math.round(dragPower * 100)}%</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#B0D8F0',
    position: 'relative',
  },
  hintContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(30, 136, 229, 0.6)',
    letterSpacing: 0.5,
  },
  powerIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  powerBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  powerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

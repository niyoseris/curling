import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Line, Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Stone, PhysicsConfig } from '@/lib/physics';
import Colors from '@/constants/colors';

interface CurlingSheetProps {
  stones: Stone[];
  config: PhysicsConfig;
  width: number;
  height: number;
}

function StoneView({ stone, scaleX, scaleY }: { stone: Stone; scaleX: number; scaleY: number }) {
  const cx = stone.x * scaleX;
  const cy = stone.y * scaleY;
  const r = 10 * scaleX;
  const isRed = stone.team === 'red';

  return (
    <>
      <Circle cx={cx} cy={cy} r={r + 2} fill="rgba(0,0,0,0.15)" />
      <Circle cx={cx} cy={cy} r={r} fill={isRed ? Colors.stoneRed : Colors.stoneYellow} />
      <Circle cx={cx} cy={cy} r={r * 0.65} fill={isRed ? Colors.stoneRedDark : Colors.stoneYellowDark} />
      <Ellipse cx={cx - r * 0.2} cy={cy - r * 0.2} rx={r * 0.25} ry={r * 0.15} fill="rgba(255,255,255,0.35)" />
    </>
  );
}

export default function CurlingSheet({ stones, config, width, height }: CurlingSheetProps) {
  const scaleX = width / config.sheetWidth;
  const scaleY = height / config.sheetHeight;
  const centerX = config.houseCenter.x * scaleX;
  const centerY = config.houseCenter.y * scaleY;
  const houseRadii = [60, 45, 30, 15];

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <RadialGradient id="iceGrad" cx="50%" cy="30%" r="80%">
            <Stop offset="0%" stopColor="#F5FBFF" />
            <Stop offset="100%" stopColor="#E0EEF8" />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={width} height={height} fill="url(#iceGrad)" />

        {Array.from({ length: 40 }).map((_, i) => (
          <Line key={`ice-${i}`} x1={0} y1={i * (height / 40)} x2={width} y2={i * (height / 40)} stroke="rgba(176, 216, 240, 0.12)" strokeWidth={0.5} />
        ))}

        <Line x1={centerX} y1={0} x2={centerX} y2={height} stroke="rgba(0,0,0,0.06)" strokeWidth={1} strokeDasharray="4,4" />

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

        <Line x1={0} y1={centerY} x2={width} y2={centerY} stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
        <Line x1={0} y1={config.hogLineY * scaleY} x2={width} y2={config.hogLineY * scaleY} stroke="#D32F2F" strokeWidth={2} />
        <Line x1={0} y1={config.backLineY * scaleY} x2={width} y2={config.backLineY * scaleY} stroke="#1565C0" strokeWidth={1.5} />
        <Line x1={0} y1={(config.sheetHeight - 60) * scaleY} x2={width} y2={(config.sheetHeight - 60) * scaleY} stroke="#D32F2F" strokeWidth={2} />

        {stones.map((stone) => (
          <StoneView key={stone.id} stone={stone} scaleX={scaleX} scaleY={scaleY} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#B0D8F0',
  },
});

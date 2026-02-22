import { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text, PanResponder, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface PowerMeterProps {
  onThrow: (power: number, angle: number) => void;
  disabled: boolean;
}

export default function PowerMeter({ onThrow, disabled }: PowerMeterProps) {
  const [power, setPower] = useState(0.5);
  const [angle, setAngle] = useState(0);
  const powerRef = useRef(0.5);
  const angleRef = useRef(0);

  const powerPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const newPower = Math.max(0.1, Math.min(1, powerRef.current - gestureState.dy / 200));
        powerRef.current = newPower;
        setPower(newPower);
      },
      onPanResponderRelease: () => {
        powerRef.current = power;
      },
    })
  ).current;

  const aimPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gestureState) => {
        const newAngle = Math.max(-0.6, Math.min(0.6, angleRef.current + gestureState.dx / 300));
        angleRef.current = newAngle;
        setAngle(newAngle);
      },
      onPanResponderRelease: () => {
        angleRef.current = angle;
      },
    })
  ).current;

  const handleThrow = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onThrow(power, angle);
    setPower(0.5);
    setAngle(0);
    powerRef.current = 0.5;
    angleRef.current = 0;
  }, [power, angle, disabled, onThrow]);

  const powerPercent = Math.round(power * 100);
  const angleDisplay = Math.round(angle * 57.3);

  const getPowerColor = () => {
    if (power < 0.4) return Colors.powerLow;
    if (power < 0.7) return Colors.powerMid;
    return Colors.powerHigh;
  };

  return (
    <View style={styles.container}>
      <View style={styles.controlsRow}>
        <View style={styles.powerSection}>
          <Text style={styles.label}>POWER</Text>
          <View style={styles.powerBarContainer} {...powerPanResponder.panHandlers}>
            <View style={styles.powerBarTrack}>
              <LinearGradient
                colors={[Colors.powerHigh, Colors.powerMid, Colors.powerLow]}
                style={[styles.powerBarFill, { height: `${power * 100}%` }]}
              />
            </View>
            <View style={[styles.powerIndicator, { bottom: `${power * 100 - 3}%` }]}>
              <View style={[styles.powerDot, { backgroundColor: getPowerColor() }]} />
            </View>
          </View>
          <Text style={[styles.powerValue, { color: getPowerColor() }]}>{powerPercent}%</Text>
        </View>

        <View style={styles.aimSection}>
          <Text style={styles.label}>AIM</Text>
          <View style={styles.aimControl} {...aimPanResponder.panHandlers}>
            <View style={styles.aimTrack}>
              <View style={styles.aimCenter} />
              <View style={[styles.aimIndicator, { left: `${50 + (angle / 0.6) * 40}%` }]}>
                <View style={styles.aimDot} />
              </View>
            </View>
            <View style={styles.aimLabels}>
              <Ionicons name="arrow-back" size={14} color="#90A4AE" />
              <Text style={styles.aimValue}>{angleDisplay > 0 ? `R ${angleDisplay}` : angleDisplay < 0 ? `L ${Math.abs(angleDisplay)}` : 'CENTER'}</Text>
              <Ionicons name="arrow-forward" size={14} color="#90A4AE" />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.throwButton,
              disabled && styles.throwButtonDisabled,
              pressed && !disabled && styles.throwButtonPressed,
            ]}
            onPress={handleThrow}
            disabled={disabled}
          >
            <Ionicons name="send" size={22} color="#FFFFFF" />
            <Text style={styles.throwText}>THROW</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  powerSection: {
    alignItems: 'center',
    gap: 6,
    width: 50,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#90A4AE',
    letterSpacing: 1.2,
  },
  powerBarContainer: {
    height: 140,
    width: 36,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  powerBarTrack: {
    width: 12,
    height: '100%',
    backgroundColor: '#263238',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignSelf: 'center',
  },
  powerBarFill: {
    width: '100%',
    borderRadius: 6,
  },
  powerIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  powerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  powerValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  aimSection: {
    flex: 1,
    gap: 10,
    justifyContent: 'center',
  },
  aimControl: {
    gap: 6,
  },
  aimTrack: {
    height: 32,
    backgroundColor: '#263238',
    borderRadius: 16,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  aimCenter: {
    position: 'absolute',
    left: '50%',
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginLeft: -1,
  },
  aimIndicator: {
    position: 'absolute',
    top: 2,
    marginLeft: -14,
  },
  aimDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  aimLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  aimValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B0BEC5',
  },
  throwButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  throwButtonDisabled: {
    backgroundColor: '#546E7A',
    opacity: 0.5,
  },
  throwButtonPressed: {
    backgroundColor: '#1565C0',
    transform: [{ scale: 0.97 }],
  },
  throwText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
});

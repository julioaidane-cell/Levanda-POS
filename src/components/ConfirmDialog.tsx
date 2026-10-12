import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Button } from './Button';
import { elevation, makeStyles, radius, spacing, typography, useReduceMotion, useTheme } from '@/theme';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const useStyles = makeStyles((c) => ({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: c.overlay,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    borderRadius: radius.xl,
    backgroundColor: c.surfaceElevated,
    ...elevation.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryTint,
    marginBottom: spacing.xs,
  },
  iconWrapDanger: { backgroundColor: c.dangerTint },
  title: { ...typography.heading, textAlign: 'center' },
  message: { ...typography.body, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg, alignSelf: 'stretch' },
  action: { flex: 1 },
}));

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const reduceMotion = useReduceMotion();

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(180)} style={styles.backdrop}>
        <Animated.View entering={reduceMotion ? undefined : FadeInDown.duration(240)} style={styles.card}>
          <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
            <Ionicons
              name={destructive ? 'trash-outline' : 'help-circle-outline'}
              size={24}
              color={destructive ? colors.danger : colors.primary}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
          <View style={styles.actions}>
            <Button label={cancelLabel} onPress={onCancel} variant="secondary" style={styles.action} disabled={loading} />
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
              style={styles.action}
              loading={loading}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

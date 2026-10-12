import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { EmptyState } from './EmptyState';
import { ScreenScroll } from './Screen';
import { ScreenHeader } from './ScreenHeader';
import { makeStyles } from '@/theme';

export interface SectionPlaceholderProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.background },
}));

/**
 * Shell for section screens that have no backend yet. Keeps the shared header
 * and pill row so these routes sit in the same navigation as the real modules.
 */
export function SectionPlaceholder({ title, message, icon = 'construct-outline' }: SectionPlaceholderProps) {
  const styles = useStyles();

  return (
    <View style={styles.root}>
      <ScreenHeader />
      <ScreenScroll>
        <EmptyState title={title} message={message} icon={icon} />
      </ScreenScroll>
    </View>
  );
}

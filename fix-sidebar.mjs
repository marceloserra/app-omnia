import fs from 'fs';

let content = fs.readFileSync('apps/mobile/components/navigation/Sidebar.tsx', 'utf8');

if (!content.includes('import { useTheme')) {
  content = content.replace('import { LinearGradient } from "expo-linear-gradient";', 'import { LinearGradient } from "expo-linear-gradient";\nimport { useTheme } from "../../lib/theme";\nimport { useTranslation } from "../../lib/i18n";');
}

// Remove old constants
content = content.replace(/const BG = "[^"]+";\n/g, '');
content = content.replace(/const SURFACE = "[^"]+";\n/g, '');
content = content.replace(/const SURFACE_2 = "[^"]+";\n/g, '');
content = content.replace(/const BORDER = "[^"]+";\n/g, '');
content = content.replace(/const INDIGO = "[^"]+";\n/g, '');
content = content.replace(/const TEXT_PRIMARY = "[^"]+";\n/g, '');
content = content.replace(/const TEXT_SECONDARY = "[^"]+";\n/g, '');
content = content.replace(/const TEXT_MUTED = "[^"]+";\n/g, '');
content = content.replace(/const RED = "[^"]+";\n/g, '');
content = content.replace(/const ACTIVE_BG = "[^"]+";\n/g, '');

// Change component signature
content = content.replace('export function Sidebar({ visible, onClose }: SidebarProps) {', 'export function Sidebar({ visible, onClose }: SidebarProps) {\n  const theme = useTheme();\n  const { t } = useTranslation();\n  const styles = React.useMemo(() => createStyles(theme), [theme]);');

// Replace styles references in JSX
content = content.replace(/color=\{TEXT_PRIMARY\}/g, 'color={theme.textPrimary}');
content = content.replace(/color=\{TEXT_SECONDARY\}/g, 'color={theme.textSecondary}');
content = content.replace(/color=\{TEXT_MUTED\}/g, 'color={theme.textMuted}');
content = content.replace(/color=\{INDIGO\}/g, 'color={theme.indigo}');
content = content.replace(/color=\{RED\}/g, 'color={theme.red}');
content = content.replace(/backgroundColor:\s*BG/g, 'backgroundColor: theme.bg');
content = content.replace(/backgroundColor:\s*ACTIVE_BG/g, 'backgroundColor: theme.activeBg');

// Replace StyleSheet.create
content = content.replace('const styles = StyleSheet.create({', 'const createStyles = (theme: any) => StyleSheet.create({');

content = content.replace(/BG/g, 'theme.bg');
content = content.replace(/SURFACE_2/g, 'theme.surface2');
content = content.replace(/SURFACE/g, 'theme.surface');
content = content.replace(/BORDER/g, 'theme.border');
content = content.replace(/INDIGO/g, 'theme.indigo');
content = content.replace(/TEXT_PRIMARY/g, 'theme.textPrimary');
content = content.replace(/TEXT_SECONDARY/g, 'theme.textSecondary');
content = content.replace(/TEXT_MUTED/g, 'theme.textMuted');
content = content.replace(/RED/g, 'theme.red');
content = content.replace(/ACTIVE_BG/g, 'theme.activeBg');

fs.writeFileSync('apps/mobile/components/navigation/Sidebar.tsx', content);

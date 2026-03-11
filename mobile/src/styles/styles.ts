import { StyleSheet, Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");
const isSmallDevice = width < 375;

export const Colors = {
  // Modern gradient colors
  gradient: {
    primary: ["#007AFF", "#5856D6"],
    secondary: ["#FF6B6B", "#FF8E8E"],
    success: ["#34C759", "#30D158"],
    danger: ["#FF3B30", "#FF453A"],
    warning: ["#FF9500", "#FF9F0A"],
    info: ["#5AC8FA", "#64D2FF"],
    dark: ["#1D1D1F", "#2C2C2E"],
    purple: ["#BF5AF2", "#C85AF2"],
    teal: ["#4ECDC4", "#5AD8D2"],
  },
  
  // Solid colors
  primary: "#007AFF",
  secondary: "#5856D6",
  success: "#34C759",
  danger: "#FF3B30",
  warning: "#FF9500",
  info: "#5AC8FA",
  dark: "#1D1D1F",
  light: "#F2F2F7",
  white: "#FFFFFF",
  black: "#000000",
  
  // Gray scale
  gray: {
    50: "#F2F2F7",
    100: "#E5E5EA",
    200: "#C7C7CC",
    300: "#AEAEB2",
    400: "#8E8E93",
    500: "#636366",
    600: "#48484A",
    700: "#3A3A3C",
    800: "#2C2C2E",
    900: "#1D1D1F",
  },
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 38,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 18,
  },
  small: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const styles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  
  // Card Styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  
  // Glass Card
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Button Styles
  buttonPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Input Styles
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    color: Colors.dark,
  },
  
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
  },
  
  // Home Screen Styles
  indexSafeArea: {
    flex: 1,
    backgroundColor: Colors.white,
    marginTop: Spacing.md,
    color: Colors.gray[500],
  },
  indexMainContainer: {
    flex: 1,
  },
  indexTitleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  indexTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.dark,
    letterSpacing: -0.5,
  },
  indexDropdownContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  indexDropdown: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
  },
  indexDropdownList: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: Radius.lg,
    backgroundColor: Colors.white,
  },
  indexFeatureContentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  indexPlaceholderText: {
    textAlign: 'center',
    color: Colors.gray[500],
    fontSize: 16,
    marginTop: Spacing.xl,
  },
  iconContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: Spacing.lg,
    zIndex: 10,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  indexLoginButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: Spacing.lg,
    zIndex: 10,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  indexLoginButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  indexIcon: {
    marginRight: Spacing.sm,
  },
  
  // Login Screen
  loginContainer: {
    flex: 1,
    backgroundColor: Colors.light,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loginTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  loginInput: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    fontSize: 16,
    color: Colors.dark,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  loginSubmitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  loginSubmitButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loggedInText: {
    textAlign: 'center',
    marginTop: Spacing.lg,
    color: Colors.success,
    fontSize: 14,
  },
  
  // Progress Tracking
  progressTrackingContainer: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  progressTrackingNavigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  progressTrackingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
  },
  progressTrackingNavigationIcon: {
    padding: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
  },
  progressTrackingProgressContainer: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  progressTrackingStatusContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  progressTrackingStatusText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: Spacing.sm,
  },
  progressTrackingTipText: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 24,
  },
  progressTrackingEditButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  progressTrackingEditButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  
  // Anomaly Detection
  AnomalyDetectioncontainer: {
    flex: 1,
    backgroundColor: Colors.light,
    paddingHorizontal: Spacing.lg,
  },
  AnomalyDetectiontitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  AnomalyDetectionnoData: {
    textAlign: 'center',
    color: Colors.gray[500],
    fontSize: 16,
    marginTop: Spacing.xl,
  },
  
  // Emergency Alerts
  emergencyAlertContainer: {
    flex: 1,
    backgroundColor: Colors.light,
    paddingHorizontal: Spacing.lg,
  },
  emergencyAlertTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emergencyAlertSubtitle: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emergencyAlertSection: {
    flex: 1,
  },
  emergencyAlertSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: Spacing.md,
  },
  emergencyAlertItem: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emergencyAlertMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: Spacing.xs,
  },
  emergencyAlertTimestamp: {
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: Spacing.xs,
  },
  emergencyAlertStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  emergencyAlertButtonContainer: {
    paddingVertical: Spacing.lg,
  },
  emergencyAlertButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  emergencyAlertButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Recommendations
  recommendationsContainer: {
    flexGrow: 1,
    backgroundColor: Colors.light,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  recommendationsScreenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  recommendationsScreenSubtitle: {
    fontSize: 16,
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  recommendationsCategoryContainer: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  recommendationsCategoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: Spacing.sm,
  },
  recommendationsTipText: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
});

export default styles;
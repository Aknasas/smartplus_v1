// app/styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  // Index styles
 indexSafeArea: {
     flex: 1,
     backgroundColor: '#F0F8FF', // Light background
   },
   indexMainContainer: {
     flexGrow: 1,
     alignItems: 'center',
     justifyContent: 'flex-start',
     width: '100%',
     backgroundColor: '#ffffff',
   },
   indexLoginButtonContainer: {
     position: 'absolute',
     top: 10,
     right: 10,
     backgroundColor: '#FFFFFF',
     padding: 8,
     borderRadius: 4,
     zIndex: 10,
     elevation: 10,
   },
   indexLoginButtonText: {
     color: '#007AFF',
     fontWeight: 'bold',
     fontSize: 16,
   },
   indexTitleContainer: {
     marginTop: 55,
     alignItems: 'center',
     marginBottom: 10,
     paddingVertical: 0,
     width: '100%',
   },
   indexTitle: {
     fontSize: 24,
     fontWeight: 'bold',
     textAlign: 'center',
     color: '#FF7F50',
   },

   // ✅ Dropdown Styles (Modal-friendly)
   indexDropdownContainer: {
     marginBottom: 10,
     width: '90%',
     alignSelf: 'center',
     borderWidth: 1,
     borderColor: '#000000',
     borderRadius: 8,
     backgroundColor: '#fafafa',
     zIndex: 2000,
     elevation: 2000,
   },
   indexDropdown: {
     backgroundColor: '#ffffff',
     borderColor: '#000000',
     borderWidth: 1,
     borderRadius: 8,
     height: 45,
     width: '100%',
     zIndex: 3000,
     elevation: 3000,
   },
   indexDropdownList: {
     backgroundColor: '#ffffff',
     borderColor: '#000000',
     zIndex: 4000,
     elevation: 4000,
   },
   indexIcon: {
     marginRight: 10,
   },

   // Feature container
   indexFeatureContentContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     padding: 10,
     backgroundColor: '#ffffff',
     width: '100%',
     borderRadius: 10,
     borderColor: '#ffffff',
     borderWidth: 1,
     zIndex: 0,
     elevation: 0,
   },
   indexPlaceholderText: {
     fontSize: 16,
     color: '#666666',
   },

   // Modal (Login)
   indexModalBackground: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     justifyContent: 'center',
     alignItems: 'center',
   },
   indexModalContainer: {
     width: '80%',
     backgroundColor: '#FFFFFF',
     borderRadius: 10,
     padding: 20,
     elevation: 5,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.25,
     shadowRadius: 4,
     maxHeight: '80%',
   },

   // Top-left icon
   iconContainer: {
     position: 'absolute',
     top: 10,
     left: 10,
     zIndex: 10,
     elevation: 10,
   },
   icon: {
     width: 40,
     height: 40,
     resizeMode: 'contain',
     borderRadius: 20,
     borderWidth: 2,
     borderColor: '#007AFF',
   },
  // HealthMonitoring styles
  healthMonitoringSubContainer: {
    flexGrow: 1,
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  healthMonitoringSubTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF5733',
  },
  healthMonitoringCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingBottom: 16,
  },

  // Login styles
  loginContainer: {
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  loginInput: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    marginBottom: 15,
  },
  loginSubmitButton: {
    backgroundColor: '#28A745',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  loginSubmitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,

  },
  loginCloseButton: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  loginCloseButtonText: {
    color: '#007BFF',
    fontSize: 16,
  },
  loginForgotPasswordText: {
    color: '#007BFF',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
  actionContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },

  actionText: {
    fontSize: 18,
    color: '#007BFF',
    marginVertical: 10,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },

  loggedInText: {
    fontSize: 16,
    color: '#28A745',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },

//ProgressTracking styles
  progressTrackingContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    width:'100%',
  },
  progressTrackingNavigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTrackingNavigationIcon: {
    padding: 10,
  },
  progressTrackingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  progressTrackingProgressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  progressTrackingStatusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressTrackingStatusText: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#00e0ff',
      marginBottom: 10,
  },
  progressTrackingTipText: {
      fontSize: 16,
      color: '#555',
      textAlign: 'center',
      paddingHorizontal: 20,
  },
  progressTrackingEditButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: '#00e0ff',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 30,
      flexDirection: 'row',
      alignItems: 'center',
  },
  progressTrackingEditButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },


  // EmergencyAlert styles
  emergencyAlertContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  emergencyAlertTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
    textAlign: 'center',
    marginVertical: 10,
  },
  emergencyAlertSubtitle: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  emergencyAlertSection: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
    alignSelf: 'center',
  },
  emergencyAlertSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  emergencyAlertItem: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    alignSelf: 'center',
  },
  emergencyAlertMessage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emergencyAlertTimestamp: {
    fontSize: 14,
    color: '#666',
  },
  emergencyAlertStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  emergencyAlertButton: {
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  emergencyAlertButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  emergencyAlertModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyAlertModalContainer: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  emergencyAlertModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  emergencyAlertInput: {
    width: '100%',
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  emergencyAlertButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },

  // AnomalyDetection styles
  AnomalyDetectioncontainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    width: '100%',
    marginTop:10,
  },
  AnomalyDetectiontitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C00',
    marginBottom: 20,
    textAlign: 'center',
  },
  AnomalyDetectionlist: {
    marginBottom: 20,
    width: '100%',
  },
  AnomalyDetectionitem: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  AnomalyDetectioncritical: {
    backgroundColor: '#FFCDD2',
  },
  AnomalyDetectionwarning: {
    backgroundColor: '#FFE082',
  },
  AnomalyDetectiontype: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  AnomalyDetectionvalue: {
    fontSize: 14,
    color: '#333',
  },
  AnomalyDetectiontimestamp: {
    fontSize: 12,
    color: '#666',
  },
  AnomalyDetectionnoData: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
//Recommendation styles
  recommendationsContainer: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    marginTop:10,
  },
  recommendationsScreenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3CB371',
    marginBottom: 10,
    textAlign: 'center',
  },
  recommendationsScreenSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  recommendationsCategoryContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  recommendationsCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#76c7c0',
    marginBottom: 10,
  },
  recommendationsTipText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default styles;

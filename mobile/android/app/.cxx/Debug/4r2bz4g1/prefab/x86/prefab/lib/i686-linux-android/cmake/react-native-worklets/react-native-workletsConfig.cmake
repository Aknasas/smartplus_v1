if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "E:/smartplus_v1/mobile/node_modules/react-native-worklets/android/build/intermediates/cxx/Debug/3w624d35/obj/x86/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "E:/smartplus_v1/mobile/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()


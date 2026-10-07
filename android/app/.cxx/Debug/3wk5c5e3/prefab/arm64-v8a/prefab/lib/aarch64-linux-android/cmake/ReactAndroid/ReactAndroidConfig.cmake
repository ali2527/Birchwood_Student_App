if(NOT TARGET ReactAndroid::hermestooling)
add_library(ReactAndroid::hermestooling SHARED IMPORTED)
set_target_properties(ReactAndroid::hermestooling PROPERTIES
    IMPORTED_LOCATION "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/cb90c71b3625d5ce3e718628a90b576a/transformed/jetified-react-android-0.82.1-debug/prefab/modules/hermestooling/libs/android.arm64-v8a/libhermestooling.so"
    INTERFACE_INCLUDE_DIRECTORIES "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/cb90c71b3625d5ce3e718628a90b576a/transformed/jetified-react-android-0.82.1-debug/prefab/modules/hermestooling/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::jsi)
add_library(ReactAndroid::jsi SHARED IMPORTED)
set_target_properties(ReactAndroid::jsi PROPERTIES
    IMPORTED_LOCATION "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/cb90c71b3625d5ce3e718628a90b576a/transformed/jetified-react-android-0.82.1-debug/prefab/modules/jsi/libs/android.arm64-v8a/libjsi.so"
    INTERFACE_INCLUDE_DIRECTORIES "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/cb90c71b3625d5ce3e718628a90b576a/transformed/jetified-react-android-0.82.1-debug/prefab/modules/jsi/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::reactnative)
add_library(ReactAndroid::reactnative SHARED IMPORTED)
set_target_properties(ReactAndroid::reactnative PROPERTIES
    IMPORTED_LOCATION "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/cb90c71b3625d5ce3e718628a90b576a/transformed/jetified-react-android-0.82.1-debug/prefab/modules/reactnative/libs/android.arm64-v8a/libreactnative.so"
    INTERFACE_INCLUDE_DIRECTORIES "/private/var/folders/2k/bnpt_2cj0hdbrqc8xj_v5thr0000gn/T/cursor-sandbox-cache/3e6fa238a72aea1f9afd21aa0bdd80de/gradle/caches/9.0.0/transforms/cb90c71b3625d5ce3e718628a90b576a/transformed/jetified-react-android-0.82.1-debug/prefab/modules/reactnative/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()


if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "C:/Users/Alaiha Traders/.gradle/caches/9.0.0/transforms/98e02d7a5f1ea7b6211dbe9dd8128749/transformed/jetified-hermes-android-0.82.1-release/prefab/modules/hermesvm/libs/android.x86_64/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Alaiha Traders/.gradle/caches/9.0.0/transforms/98e02d7a5f1ea7b6211dbe9dd8128749/transformed/jetified-hermes-android-0.82.1-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()


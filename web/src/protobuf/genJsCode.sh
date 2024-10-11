# Add pbjs path
# /Users/huyuhua/Solutions/DarkEggProj/AgoraSttDemo/src/Web/SttWebDemo
# /Users/huyuhua/Solutions/DarkEggProj/AgoraDemoServer/src/Web/SttWebDemo/node_modules/protobufjs-cli
# /Users/huyuhua/Solutions/DarkEggProj/AgoraSttDemo/src/Web/SttWebDemo/src/node_modules/protobufjs-cli/bin
export "PATH=$PATH:/Users/huyuhua/Solutions/DarkEggProj/AgoraDemoServer/src/Web/SttWebDemo/node_modules/protobufjs-cli/bin"
# gen javascript code
# pbjs -t static ./SttMessage.proto > ./SttMessage_pb.js
# pbjs -t static-module ./SttMessage.proto > ./SttMessage_pbm.js
pbjs -t json-module ./SttMessage.proto > ./SttMessage001.js
pbjs -t json-module  -w es6 ./SttMessage.proto > ./SttMessage002.js
pbjs -t static-module -w es6 ./SttMessage.proto > ./SttMessage003.js

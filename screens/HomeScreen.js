import React, { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Modal, Picker } from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

export default function HomeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [hasPermissionMedia, setHasPermissionMedia] = useState(null);
  const [hasPermissionVideo, setHasPermissionVideo] = useState(null);

  const [type, setType] = useState(Camera.Constants.Type.back);

  const [video, setVideo] = useState(false);
  const [recording, setRecording] = useState(false);

  const [modalData, setModalData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      setHasPermissionMedia(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (video) {
      (async () => {
        const { status } = await Permissions.askAsync(
          Permissions.AUDIO_RECORDING
        );
        setHasPermissionVideo(status === "granted");
      })();
    }
  }, [video]);

  const onPictureSaved = async photo => {
    await FileSystem.moveAsync({
      from: photo.uri,
      to: `${FileSystem.documentDirectory}${Date.now()}.jpg`
    });

    const asset = await MediaLibrary.createAssetAsync(photo.uri);

    alert("Photo has successfully saved");
  };

  const takePhoto = async () => {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync();
      let albums = await MediaLibrary.getAlbumsAsync();
      console.log(albums, "ni albums");
      await setModalData({ uri: photo.uri, albums });
      await setModalVisible(true);
      // const asset = await MediaLibrary.createAssetAsync(photo.uri);
      // alert("Photo has successfully saved");
    }
  };
  const startRecording = () => {};
  const stopRecording = () => {};

  if (modalVisible) {
    return (
      <ModalCustom
        modalData={modalData}
        visible={modalVisible}
        close={() => setModalVisible(false)}
      />
    );
  }
  if (!video && hasPermission === null) {
    return <View />;
  }
  if (video && hasPermissionVideo === null) {
    return <View />;
  }
  if (!video && hasPermission === false) {
    return <Text>No access to camera</Text>;
  }
  if (video && hasPermissionVideo === false) {
    return <Text>No access to Audio</Text>;
  }
  if (hasPermissionMedia === false) {
    return <Text>No Access to Media</Text>;
  }
  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={{ flex: 1 }}
        type={type}
        ref={ref => {
          this.camera = ref;
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "transparent",
            flexDirection: "row"
          }}
        >
          <TouchableOpacity
            style={{
              flex: 0.1,
              alignSelf: "flex-end",
              alignItems: "center"
            }}
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10, color: "white" }}>
              {" "}
              Flip{" "}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 0.8,
              alignSelf: "flex-end",
              alignItems: "center"
            }}
            onPress={() => {
              !video
                ? takePhoto()
                : !recording
                ? startRecording()
                : stopRecording();
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10, color: "white" }}>
              {" "}
              {video ? "Start" : "Shoot"}{" "}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 0.15,
              alignSelf: "flex-end",
              alignItems: "center"
            }}
            onPress={() => {
              video ? setVideo(false) : setVideo(true);
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10, color: "white" }}>
              {" "}
              {video ? "Photo" : "Video"}{" "}
            </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const ModalCustom = ({ visible, modalData, close }) => {
  console.log(modalData, "iniModalDaraaaaaaaaaaaa");
  const [album, setAlbum] = useState("");

  return (
    <View style={{ marginTop: 22 }}>
      <Modal animationType="slide" visible={visible}>
        <Text>Cuuuuk</Text>
        <Picker
          style={{ height: 50, width: 300 }}
          onValueChange={(itemValue, itemIndex) => setAlbum(itemValue)}
        >
          {modalData &&
            modalData.albums &&
            modalData.albums.map((el, index) => (
              <Picker.Item label={el.title} key={index} value={el.id} />
            ))}
        </Picker>
        <TouchableOpacity onPress={close}>
          <Text>close</Text>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

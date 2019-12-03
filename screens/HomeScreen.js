import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Modal,
  Picker,
  TextInput,
  Button
} from "react-native";
import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { withNavigationFocus } from "react-navigation";

function HomeScreen(props) {
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
      const asset = await MediaLibrary.createAssetAsync(photo.uri);
      setModalData({ asset, albums });
      setModalVisible(true);
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
      {props && props.isFocused && (
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
      )}
    </View>
  );
}

const ModalCustom = ({ visible, modalData, close }) => {
  const [album, setAlbum] = useState("");
  const [newAlbum, setNewAlbum] = useState(false);
  const [titleNewAlbum, setTitleNewAlbum] = useState("");

  React.useEffect(() => {
    modalData &&
      modalData.albums &&
      modalData.albums[0] &&
      setAlbum(modalData.albums[0].id);
  }, []);

  React.useEffect(() => {
    if (titleNewAlbum) {
      setNewAlbum(true);
    } else {
      setNewAlbum(false);
    }
  }, [titleNewAlbum]);

  const onPressSubmit = async () => {
    if (newAlbum) {
      MediaLibrary.createAlbumAsync(titleNewAlbum, modalData.asset, false)
        .then(() => {
          alert(`Asset has successfully saved into new album!`);
          close();
        })
        .catch(err => {
          alert("Some error occurred. Sorry!");
        });
    } else {
      MediaLibrary.addAssetsToAlbumAsync(modalData.asset, album, false)
        .then(() => {
          alert(`Asset has successfully saved into existing album!`);
          close();
        })
        .catch(err => {
          alert("cannot save to this album!");
        });
    }
  };

  return (
    <View style={{ marginTop: 22 }}>
      <Modal animationType="slide" visible={visible}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            marginHorizontal: 40
          }}
        >
          <View>
            <Text>Save your photo/video in existing album</Text>
            <Picker
              style={{ height: 50, width: 300 }}
              onValueChange={(itemValue, itemIndex) => setAlbum(itemValue)}
              enabled={!newAlbum}
              selectedValue={album}
              // prompt="choose one"
            >
              {modalData &&
                modalData.albums &&
                modalData.albums.map((el, index) => (
                  <Picker.Item label={el.title} key={index} value={el.id} />
                ))}
            </Picker>
          </View>
          <View>
            <Text>Or create new album!</Text>
            <View style={{ marginVertical: 10 }}>
              <TextInput
                onChangeText={text => setTitleNewAlbum(text)}
                value={titleNewAlbum}
                style={{
                  borderColor: "black",
                  borderWidth: 1,
                  borderStyle: "solid"
                }}
              />
            </View>
          </View>
          <View>
            <View style={{ marginBottom: 10 }}>
              <Button onPress={onPressSubmit} title={"Save!"} />
            </View>
            <View>
              <Button onPress={close} title={"Close"} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default withNavigationFocus(HomeScreen);

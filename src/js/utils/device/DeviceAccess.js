export const askMotionAccess = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        alert("test")
        DeviceMotionEvent.requestPermission().then(permissionState => {
            alert(permissionState);
            if (permissionState === 'granted') {
                console.log("access sensors", permissionState)
                location.reload()
            }
        }).catch(console.error)
    }
}
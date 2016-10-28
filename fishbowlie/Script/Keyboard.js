function KeyPress(e) {

    var key;

    // Get key code
    if (e.keyCode) {
        key = e.keyCode;
    } else if (document.all) {
        key = event.keyCode;
    } else {
        key = ev.charCode;
    }

    switch (key) {
        case 68:
            fishBowl.ToggleBowlEdges();
            break;
        case 72:
            frame.Hide();
            water.PauseAudio();
            water.PauseVideo();
            fishBowl.HideBowlMask();
            fishBowl.HideBowlBack();
            fishBowl.HideBowlFront();
            fishBowl.HideBowlShine();
            fishBowl.HideBowlShadow();
            fishBowl.HideFish();
            fpsMeter.HideMeter();
            fpsMeter.HideNeedle();
            logo.Hide();
            fpsMeter.Hide();
            break;
        case 83:
            frame.Show();
            water.PlayAudio();
            water.PlayVideo();
            fishBowl.ShowBowlMask();
            fishBowl.ShowBowlBack();
            fishBowl.ShowBowlFront();
            fishBowl.ShowBowlShine();
            fishBowl.ShowBowlShadow();
            fishBowl.ShowFish();
            fpsMeter.ShowMeter();
            fpsMeter.ShowNeedle();
            logo.Show();
            fpsMeter.Show();
            break;
        case 107:
            fishBowl.AddFish(false);
            break;
        case 109:
            fishBowl.RemoveFish();
            break;
        case 49:
            StopDrawing();
            break;
        case 50:
            StepDrawing();
            break;
        case 51:
            StartDrawing();
            break;

    }

    //alert("Key:" + key);
}

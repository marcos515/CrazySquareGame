package br.com.scgf.squarecrazygame.ui.login;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.gson.Gson;

import java.net.URISyntaxException;

import br.com.scgf.squarecrazygame.R;
import br.com.scgf.squarecrazygame.data.model.MessageModel;
import br.com.scgf.squarecrazygame.service.TokenManager;
import br.com.scgf.squarecrazygame.service.WebSocketService;
import io.socket.client.IO;
import io.socket.client.Socket;

@RequiresApi(api = Build.VERSION_CODES.N)
public class ControlsActivity extends AppCompatActivity {
    private String username;
    private String token = null;
    private Gson gson = new Gson();
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_controls);
        Intent intent = getIntent();
        username = intent.getStringExtra("username");
        setListeners();


        sendMsg("register", username);

    }

    private void setListeners() {
        Button leftB = findViewById(R.id.left_button);
        Button rightB = findViewById(R.id.right_button);
        Button backB = findViewById(R.id.backward_button);
        Button forwardB = findViewById(R.id.forward_button);

        leftB.setOnClickListener(v->{
            sendMsg("moveL", null);
        });
        rightB.setOnClickListener(v->{
            sendMsg("moveR", null);
        });
        forwardB.setOnClickListener(v->{
            sendMsg("moveU", null);
        });
        backB.setOnClickListener(v->{
            sendMsg("moveD", null);
        });
    }


    private void sendMsg(String topic, String msg){
        if(msg != null){
            if(token == null){
                TokenManager.getToken((t)->{
                    token = t;
                    MessageModel msg_ = new MessageModel(username, msg, token);
                    WebSocketService.getConnectWebSocket((s)->{s.emit(topic, gson.toJson(msg_));});
                });
            } else {
                MessageModel msg_ = new MessageModel(username, msg, token);
                WebSocketService.getConnectWebSocket((s)->{s.emit(topic, gson.toJson(msg_));});
            }
        } else {
            if(token == null){
                TokenManager.getToken((t)->{
                    token = t;
                    MessageModel msg_ = new MessageModel(username, "", token);
                    WebSocketService.getConnectWebSocket((s)->{s.emit(topic, gson.toJson(msg_));});
                });
            } else {
                MessageModel msg_ = new MessageModel(username, "", token);
                WebSocketService.getConnectWebSocket((s)->{s.emit(topic, gson.toJson(msg_));});
            }
        }
    }
}
package br.com.scgf.squarecrazygame.service;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;

import androidx.annotation.RequiresApi;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;

import java.net.URISyntaxException;
import java.util.function.Consumer;

import br.com.scgf.squarecrazygame.R;
import io.socket.client.IO;
import io.socket.client.Socket;

public class WebSocketService {
    private static String host = "";
    private static Socket socket = null;

    @RequiresApi(api = Build.VERSION_CODES.N)
    public static void getConnectWebSocket(Consumer<Socket> callback) {
        FirebaseDatabase database = FirebaseDatabase.getInstance();
        DatabaseReference myRef = database.getReference("apiHost");

        if(socket == null){
            myRef.addValueEventListener(new ValueEventListener() {
                @RequiresApi(api = Build.VERSION_CODES.N)
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    String value = dataSnapshot.getValue(String.class);
                    host = value;
                    if(socket == null) {
                        try {
                            socket = IO.socket(host);
                            socket.connect();
                            callback.accept(socket);
                        } catch (URISyntaxException e) {
                            e.printStackTrace();
                        }
                    }
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    Log.w("TAG", "Failed to read value.", error.toException());
                }
            });
        } else {
            callback.accept(socket);
        }

        //socket.emit("register", "{'username': " + username + "}");
    }
}

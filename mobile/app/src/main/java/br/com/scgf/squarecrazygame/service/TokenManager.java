package br.com.scgf.squarecrazygame.service;

import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

import java.util.function.Consumer;

public class TokenManager {
    private static String token = null;

    @RequiresApi(api = Build.VERSION_CODES.N)
    public static void getToken(Consumer<String> cb) {
        if (token == null) {
            FirebaseMessaging.getInstance().getToken()
                    .addOnCompleteListener(new OnCompleteListener<String>() {
                        @Override
                        public void onComplete(@NonNull Task<String> task) {
                            if (!task.isSuccessful()) {
                                Log.w("TAG", "Fetching FCM registration token failed", task.getException());
                                return;
                            }

                            token = task.getResult();
                            cb.accept(token);
                        }
                    });
        } else {
            cb.accept(token);
        }
    }

}

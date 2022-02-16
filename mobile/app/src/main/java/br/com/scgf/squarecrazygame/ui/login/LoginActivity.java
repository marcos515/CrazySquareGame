package br.com.scgf.squarecrazygame.ui.login;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import br.com.scgf.squarecrazygame.R;


public class LoginActivity extends AppCompatActivity {


    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        setOnClickButton();
    }

    private void setOnClickButton() {
        Button enter = findViewById(R.id.login_button);
        EditText editText = findViewById(R.id.username);
        enter.setOnClickListener(v->{
            String message = editText.getText().toString();
            if(message.length()>0){
                Intent intent = new Intent(this, ControlsActivity.class);
                intent.putExtra("username", message);
                startActivity(intent);
            } else {
                Toast.makeText(this, "Insert a username.", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
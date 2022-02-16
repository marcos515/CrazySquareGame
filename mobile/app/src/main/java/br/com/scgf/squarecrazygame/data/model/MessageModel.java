package br.com.scgf.squarecrazygame.data.model;


public class MessageModel {
    private String message;
    private String token;
    private String username;

    public MessageModel(String username, String message, String token){
        this.message = message;
        this.token = token;
        this.username = username;
    }
}
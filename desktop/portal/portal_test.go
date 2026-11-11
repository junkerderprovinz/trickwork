package portal

import "testing"

func TestTheAnswerNamesTheChosenFile(t *testing.T) {
	got, err := pathFromURI("file:///run/user/1000/doc/1a2b3c/My%20Art.txt")
	if err != nil {
		t.Fatal(err)
	}
	if got != "/run/user/1000/doc/1a2b3c/My Art.txt" {
		t.Errorf("path %q", got)
	}
}

func TestAnAnswerOutsideTheFileSystemIsRefused(t *testing.T) {
	if got, err := pathFromURI("https://example.com/art.txt"); err == nil {
		t.Errorf("took %q for a file", got)
	}
}

func TestTheRequestSuggestsTheName(t *testing.T) {
	opts := saveOptions("helmet.txt", "trickwork42")
	if name, _ := opts["current_name"].Value().(string); name != "helmet.txt" {
		t.Errorf("current_name %q", name)
	}
	if token, _ := opts["handle_token"].Value().(string); token != "trickwork42" {
		t.Errorf("handle_token %q", token)
	}
}

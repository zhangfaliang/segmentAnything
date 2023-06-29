import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function AlertDialog({
  open,
  setOpen,
  handleYes = () => {},
}: any) {
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle style={{ width: "350px" }} id="alert-dialog-title">
          {" "}
          确定删除mask所有文件
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            要删除吗 ？？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            sx={{
              my: 3,

              display: "block",
            }}
            color="secondary"
            onClick={handleClose}
          >
            取消
          </Button>
          <Button
            color="secondary"
            sx={{
              my: 3,
              display: "block",
            }}
            variant="contained"
            onClick={handleYes}
            autoFocus
          >
            确定
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

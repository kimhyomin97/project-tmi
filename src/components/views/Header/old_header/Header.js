// import { AppBar, Button, IconButton, makeStyles, Toolbar, Typography } from '@material-ui/core';
// import MenuIcon from '@material-ui/icons/Menu';
import { useEffect, useState } from 'react';
import './public/Header.css';
// import { useStyles } from "./public/styles";
// const useStyles = makeStyles((theme) => ({
//   root: {
//     flexGrow: 1,
//   },
//   menuButton: {
//     marginRight: theme.spacing(2),
//   },
//   title: {
//     flexGrow: 1,
//   },
// }));


function Header() {
  const [trigger, setTrigger] = useState(true);

  // const menuTrigger = document.querySelector('.header_menu_trigger');

  // menuTrigger.addEventListener('click', (e) => {
  //   e.currentTarget.classList.toggle('active-1');
  // });

  // useEffect(() => {
    
  // }, trigger);
  
  const triggerClick = () => {
    setTrigger(!trigger);
  }

  // const classes = useStyles();

  return (
    // <>
    // <AppBar position="static">
    //   <Toolbar variant="dense">
    //     <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
    //       <MenuIcon />
    //     </IconButton>
    //     <Typography variant="h6" className={classes.title}>
    //       TMI
    //     </Typography>
    //     <Button color="inherit">Login</Button>
    //   </Toolbar>
    // </AppBar>
    // </>
      <>
        <header className="header_wrap">
          {/* 헤더 선택적으로 나오게 수정 */}
          <a className="header_logo" href="/">TMI</a>
          <div className="header_item_wrap">
            <div className="header_item">
                <a href="/homepage">Homepage</a>
            </div>
            {/* <a href="/mappage">
              <div className="header_item">
                  MapPage
              </div>
            </a> */}
            <div className="header_item">
                <a href="/mappage">MapPage</a>
            </div>
            <div className="header_item">
                <a href="/word">Word</a>
            </div>
            <div className="header_item">
                <a href="/trend">Trend</a>
            </div>
            <div className="header_item">
                <a href="/study">Study</a>
            </div>
            {trigger ? 
              <div className="header_item header_icon">
                <a className="header_menu_trigger" href="#" onClick={() => triggerClick()}>
                  <span></span>
                  <span></span>
                  <span></span>
                </a>
              </div> :
                <div className="header_item header_icon">
                  <a className="header_menu_trigger active-1" href="#" onClick={() => triggerClick()}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </a>
                </div>
            }
          </div>
          {/* <input class="burger-check" type="checkbox" id="burger-check" />
          <label class="burger-icon" for="burger-check"><span class="burger-sticks"></span></label>
          <div class="menu">
            <div style="width: 200px"></div>
          </div> */}
        {/* </header> */}
        {trigger ?
          <div className="header_menu header_menu_close"></div>
          :
          <div className="header_menu header_menu_open">menu_open</div>
        }
        {/* <div className = {trigger ? "header_menu header_menu_close" : "header_menu header_menu_open"}>
          menu_open
        </div> */}
        {/* menu_open의 길이가 짧은것은 페이지내의 컨텐츠가 적어서 body가 짧아졌기 때문 */}
        </header>
      </>
  );
}

export default Header;

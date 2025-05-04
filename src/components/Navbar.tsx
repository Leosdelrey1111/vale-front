import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  AppBar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  Button,
  Divider,
} from "@mui/material";

import LogoutIcon from "@mui/icons-material/Logout";
import BookIcon from "@mui/icons-material/Book";
import AccountCircle from "@mui/icons-material/AccountCircle";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { logout, user } = useAuth();
  const location = useLocation(); // Hook para obtener la ruta actual

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Función para verificar si la ruta es activa
  const isActive = (path: string) => location.pathname === path;

  return (
    <Box sx={{ flexGrow: 1, mb: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <BookIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Gestión bibliotecaria
          </Typography>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Button
              component={Link}
              to="/prestamo"
              color="inherit"
              sx={{
                color: isActive("/prestamo") ? "black" : "white",
              }}
            >
              Préstamo
            </Button>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ bgcolor: "white" }}
            />
            <Button
              component={Link}
              to="/material"
              color="inherit"
              sx={{
                color: isActive("/material") ? "black" : "white",
              }}
            >
              Material
            </Button>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ bgcolor: "white" }}
            />
            <Button
              component={Link}
              to="/usuario"
              color="inherit"
              sx={{
                color: isActive("/usuario") ? "black" : "white",
              }}
            >
              Usuario
            </Button>

            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ bgcolor: "white" }}
            />
            <Button
              component={Link}
              to="/autores"
              color="inherit"
              sx={{
                color: isActive("/autores") ? "black" : "white",
              }}
            >
              Autores
            </Button>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ bgcolor: "white" }}
            />
            <Button
              component={Link}
              to="/categorias"
              color="inherit"
              sx={{
                color: isActive("/categorias") ? "black" : "white",
              }}
            >
              Categorías
            </Button>
            <Divider
              orientation="vertical"
              variant="middle"
              flexItem
              sx={{ bgcolor: "white" }}
            />
            <Button
              component={Link}
              to="/editoriales"
              color="inherit"
              sx={{
                color: isActive("/editoriales") ? "black" : "white",
              }}
            >
              Editoriales
            </Button>
          </Box>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              {user?.nombre} - {user?.correo}
            </MenuItem>
            <MenuItem
              onClick={() => {
                logout();
                handleClose();
              }}
            >
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export { Navbar };

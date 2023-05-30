<template>
    <a href="#"><span><slot>click</slot></span></a>
</template>

<script setup></script>

<style>
    a { 
        text-decoration: none;
        color: var(--purple);
        font-family: Audiowide;
        font-size: 28px;
        font-weight: 400;
        line-height: 36px;
        letter-spacing: 0em;
        text-align: center;
        display: inline-block;
        background: var(--pink);
        padding: 10px 10px;
        border-top: solid 4px var(--light);
        border-left: solid 4px var(--light);
        border-right: solid 4px var(--purple);
        border-bottom: solid 4px var(--purple);
    }
    span {
        color: var(--purple);
        padding: 1px 32px;
        border: 3px dotted var(--pink);
        transition: border .5s ease;
    }

    a:hover span {
        border: 3px dotted var(--purple);
    }

    a:hover {
        border-top: solid 6px var(--light);
        border-left: solid 6px var(--light);
        border-right: solid 6px var(--purple);
        border-bottom: solid 6px var(--purple);
        font-size: 29px;
    }

    a:active {
        border-top: solid 2px var(--light);
        border-left: solid 2px var(--light);
        border-right: solid 2px var(--purple);
        border-bottom: solid 2px var(--purple);
        font-size: 26px;
    }

    a:active span {
        border: 3px dotted var(--pink);
    }
</style>
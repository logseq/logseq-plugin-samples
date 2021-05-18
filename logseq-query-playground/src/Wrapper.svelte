<div class="wrapper">
  <span class="header">
    <slot name="header" />
  </span>
  <div class="content"><slot /></div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-flow: column;
    flex-basis: 50%;
    flex-grow: 0;
    flex-shrink: 0;
    max-width: 50%;
  }

  .header {
    font-size: 18px;
    padding: 0 8px;
    height: 32px;
    background: #000;
    display: flex;
    align-items: center;
    color: #fff;
    font-weight: 600;
  }

  .content {
    flex: 1;
  }
</style>
